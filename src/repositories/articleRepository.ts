import { Pool } from 'pg';
import { Article, CreateArticleInput, UpdateArticleInput, PaginationParams, ArticleWithAuthor } from '../types';
import { pool } from '../config/database';

export class ArticleRepository {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  async create(articleData: CreateArticleInput & { author_id: number; slug: string }): Promise<Article> {
    const query = `
      INSERT INTO articles (title, content, author_id, slug, published_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      articleData.title,
      articleData.content,
      articleData.author_id,
      articleData.slug,
      articleData.published_at || null,
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async findById(id: number): Promise<ArticleWithAuthor | null> {
    const query = `
      SELECT 
        a.*,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email
        ) as author
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.id = $1
    `;
    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      ...row,
      author: row.author,
    };
  }

  async findAll(params: PaginationParams): Promise<{ articles: ArticleWithAuthor[]; total: number }> {
    const { page, limit, sort = 'desc' } = params;
    const offset = (page - 1) * limit;
    const sortOrder = sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countQuery = 'SELECT COUNT(*) FROM articles';
    const countResult = await this.pool.query(countQuery);
    const total = parseInt(countResult.rows[0].count, 10);

    const query = `
      SELECT 
        a.*,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email
        ) as author
      FROM articles a
      JOIN users u ON a.author_id = u.id
      ORDER BY a.created_at ${sortOrder}
      LIMIT $1 OFFSET $2
    `;
    const result = await this.pool.query(query, [limit, offset]);
    
    return {
      articles: result.rows.map(row => ({
        ...row,
        author: row.author,
      })),
      total,
    };
  }

  async update(id: number, articleData: UpdateArticleInput & { slug?: string }, authorId: number): Promise<Article | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (articleData.title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(articleData.title);
    }
    if (articleData.slug !== undefined) {
      updates.push(`slug = $${paramCount++}`);
      values.push(articleData.slug);
    }
    if (articleData.content !== undefined) {
      updates.push(`content = $${paramCount++}`);
      values.push(articleData.content);
    }
    if (articleData.published_at !== undefined) {
      updates.push(`published_at = $${paramCount++}`);
      values.push(articleData.published_at);
    }

    if (updates.length === 0) {
      return this.findById(id) as Promise<Article | null>;
    }

    values.push(id, authorId);
    const query = `
      UPDATE articles
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount} AND author_id = $${paramCount + 1}
      RETURNING *
    `;
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number, authorId: number): Promise<boolean> {
    const query = 'DELETE FROM articles WHERE id = $1 AND author_id = $2';
    const result = await this.pool.query(query, [id, authorId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async checkAuthor(id: number, authorId: number): Promise<boolean> {
    const query = 'SELECT id FROM articles WHERE id = $1 AND author_id = $2';
    const result = await this.pool.query(query, [id, authorId]);
    return result.rows.length > 0;
  }

  async findBySlug(slug: string, excludeId?: number): Promise<Article | null> {
    const query = excludeId 
      ? 'SELECT * FROM articles WHERE slug = $1 AND id != $2'
      : 'SELECT * FROM articles WHERE slug = $1';
    const values = excludeId ? [slug, excludeId] : [slug];
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }
}


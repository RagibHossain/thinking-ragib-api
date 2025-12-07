import { ArticleRepository } from '../repositories/articleRepository';
import { CreateArticleInput, UpdateArticleInput, PaginationParams, PaginatedResponse, ArticleWithAuthor } from '../types';
import { generateSlug } from '../utils/slugify';

export class ArticleService {
  private articleRepository: ArticleRepository;

  constructor() {
    this.articleRepository = new ArticleRepository();
  }

  async createArticle(articleData: CreateArticleInput, authorId: number): Promise<ArticleWithAuthor> {
    // Generate slug from title
    const baseSlug = generateSlug(articleData.title);
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (await this.slugExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const article = await this.articleRepository.create({
      ...articleData,
      author_id: authorId,
      slug,
    });

    return this.articleRepository.findById(article.id) as Promise<ArticleWithAuthor>;
  }

  async getArticleById(id: number): Promise<ArticleWithAuthor> {
    const article = await this.articleRepository.findById(id);
    if (!article) {
      throw new Error('Article not found');
    }
    return article;
  }

  async getAllArticles(params: PaginationParams): Promise<PaginatedResponse<ArticleWithAuthor>> {
    const { articles, total } = await this.articleRepository.findAll(params);
    const totalPages = Math.ceil(total / params.limit);

    return {
      data: articles,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }

  async updateArticle(id: number, articleData: UpdateArticleInput, authorId: number): Promise<ArticleWithAuthor> {
    // Check if article exists and user is author
    const isAuthor = await this.articleRepository.checkAuthor(id, authorId);
    if (!isAuthor) {
      throw new Error('Forbidden: You are not the author of this article');
    }

    // If title is being updated, regenerate slug
    let updateData: UpdateArticleInput & { slug?: string } = { ...articleData };
    if (articleData.title) {
      const baseSlug = generateSlug(articleData.title);
      let slug = baseSlug;
      let counter = 1;

      while (await this.slugExists(slug, id)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }

    const article = await this.articleRepository.update(id, updateData, authorId);
    if (!article) {
      throw new Error('Article not found');
    }

    return this.articleRepository.findById(id) as Promise<ArticleWithAuthor>;
  }

  async deleteArticle(id: number, authorId: number): Promise<void> {
    // Check if article exists and user is author
    const isAuthor = await this.articleRepository.checkAuthor(id, authorId);
    if (!isAuthor) {
      throw new Error('Forbidden: You are not the author of this article');
    }

    const deleted = await this.articleRepository.delete(id, authorId);
    if (!deleted) {
      throw new Error('Article not found');
    }
  }

  private async slugExists(slug: string, excludeId?: number): Promise<boolean> {
    const article = await this.articleRepository.findBySlug(slug, excludeId);
    return article !== null;
  }
}


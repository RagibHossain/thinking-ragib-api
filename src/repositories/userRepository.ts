import { Pool } from 'pg';
import { User, CreateUserInput } from '../types';
import { pool } from '../config/database';

export class UserRepository {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  async create(userData: CreateUserInput & { password_hash: string }): Promise<User> {
    const query = `
      INSERT INTO users (email, password_hash, name)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [userData.email, userData.password_hash, userData.name];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.pool.query(query, [email]);
    return result.rows[0] || null;
  }

  async findById(id: number): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findOrCreateByOAuth(email: string, name: string): Promise<User> {
    let user = await this.findByEmail(email);
    
    if (!user) {
      // Create user with a dummy password hash for OAuth users
      // In production, you might want to handle OAuth users differently
      const query = `
        INSERT INTO users (email, password_hash, name)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const dummyHash = 'oauth_user_no_password';
      const result = await this.pool.query(query, [email, dummyHash, name]);
      user = result.rows[0];
    }
    
    return user;
  }
}


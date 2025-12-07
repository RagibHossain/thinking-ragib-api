export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  author_id: number;
  slug: string;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

export interface CreateArticleInput {
  title: string;
  content: string;
  published_at?: Date | null;
}

export interface UpdateArticleInput {
  title?: string;
  content?: string;
  published_at?: Date | null;
}

export interface JWTPayload {
  userId: number;
  email: string;
  type: 'access' | 'refresh';
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ArticleWithAuthor extends Article {
  author: {
    id: number;
    name: string;
    email: string;
  };
}


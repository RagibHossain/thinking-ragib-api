import { Request, Response, NextFunction } from 'express';
import { ArticleService } from '../services/articleService';
import { CustomError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { PaginationParams } from '../types';

export class ArticleController {
  private articleService: ArticleService;

  constructor() {
    this.articleService = new ArticleService();
  }

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return next(new CustomError('User not authenticated', 401));
      }

      const { title, content, published_at } = req.body;
      const article = await this.articleService.createArticle(
        { title, content, published_at },
        userId
      );

      res.status(201).json({
        success: true,
        message: 'Article created successfully',
        data: article,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return next(new CustomError('Invalid article ID', 400));
      }

      const article = await this.articleService.getArticleById(id);

      res.status(200).json({
        success: true,
        message: 'Article retrieved successfully',
        data: article,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Article not found') {
        return next(new CustomError(error.message, 404));
      }
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, sort } = req.query as any;
      const params: PaginationParams = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        sort: sort || 'desc',
      };

      const result = await this.articleService.getAllArticles(params);

      res.status(200).json({
        success: true,
        message: 'Articles retrieved successfully',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return next(new CustomError('User not authenticated', 401));
      }

      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return next(new CustomError('Invalid article ID', 400));
      }

      const { title, content, published_at } = req.body;
      const article = await this.articleService.updateArticle(
        id,
        { title, content, published_at },
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Article updated successfully',
        data: article,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Forbidden')) {
          return next(new CustomError(error.message, 403));
        }
        if (error.message === 'Article not found') {
          return next(new CustomError(error.message, 404));
        }
      }
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return next(new CustomError('User not authenticated', 401));
      }

      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return next(new CustomError('Invalid article ID', 400));
      }

      await this.articleService.deleteArticle(id, userId);

      res.status(200).json({
        success: true,
        message: 'Article deleted successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Forbidden')) {
          return next(new CustomError(error.message, 403));
        }
        if (error.message === 'Article not found') {
          return next(new CustomError(error.message, 404));
        }
      }
      next(error);
    }
  };
}


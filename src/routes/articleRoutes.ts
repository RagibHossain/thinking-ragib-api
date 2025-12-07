import { Router } from 'express';
import { ArticleController } from '../controllers/articleController';
import { authenticate } from '../middleware/auth';
import { validate, createArticleSchema, updateArticleSchema } from '../middleware/validation';
import { validatePagination } from '../middleware/queryValidator';

const router = Router();
const articleController = new ArticleController();

// Public routes
router.get('/', validatePagination, articleController.getAll);
router.get('/:id', articleController.getById);

// Protected routes
router.post('/', authenticate, validate(createArticleSchema), articleController.create);
router.put('/:id', authenticate, validate(updateArticleSchema), articleController.update);
router.delete('/:id', authenticate, articleController.delete);

export default router;


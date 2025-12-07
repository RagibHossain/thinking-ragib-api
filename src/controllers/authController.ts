import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { CustomError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name } = req.body;
      const result = await this.authService.signup({ email, password, name });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'User with this email already exists') {
        return next(new CustomError(error.message, 409));
      }
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        return next(new CustomError(error.message, 401));
      }
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        return next(new CustomError(error.message, 401));
      }
      next(error);
    }
  };

  oauthCallback = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // This will be called after OAuth authentication
      // The user info should be available from the OAuth provider
      const user = req.user;
      if (!user) {
        return next(new CustomError('OAuth authentication failed', 401));
      }

      // Get user info from OAuth profile (this would come from passport strategy)
      // For now, we'll use a placeholder - in production, this would come from the OAuth provider
      const email = (req as any).oauthEmail || user.email;
      const name = (req as any).oauthName || 'OAuth User';

      const result = await this.authService.handleOAuthLogin(email, name);

      // Redirect to frontend with tokens or return JSON
      res.status(200).json({
        success: true,
        message: 'OAuth login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}


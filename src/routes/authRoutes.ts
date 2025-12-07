import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validate, signupSchema, loginSchema, refreshTokenSchema } from '../middleware/validation';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { oauthConfig } from '../config/oauth';
import { AuthService } from '../services/authService';

const router = Router();
const authController = new AuthController();
const authService = new AuthService();

// Configure Google OAuth Strategy
if (oauthConfig.google.clientID && oauthConfig.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: oauthConfig.google.clientID,
        clientSecret: oauthConfig.google.clientSecret,
        callbackURL: oauthConfig.google.callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || '';
          const name = profile.displayName || profile.name?.givenName || 'User';
          const user = await authService.handleOAuthLogin(email, name);
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// Configure GitHub OAuth Strategy
if (oauthConfig.github.clientID && oauthConfig.github.clientSecret) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: oauthConfig.github.clientID,
        clientSecret: oauthConfig.github.clientSecret,
        callbackURL: oauthConfig.github.callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || profile.username + '@github.com';
          const name = profile.displayName || profile.username || 'User';
          const user = await authService.handleOAuthLogin(email, name);
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

// Regular authentication routes
router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);

// OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/oauth/failure' }),
  (req, res) => {
    // OAuth success - return tokens
    const user = req.user as any;
    res.status(200).json({
      success: true,
      message: 'OAuth login successful',
      data: user,
    });
  }
);

router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/api/auth/oauth/failure' }),
  (req, res) => {
    // OAuth success - return tokens
    const user = req.user as any;
    res.status(200).json({
      success: true,
      message: 'OAuth login successful',
      data: user,
    });
  }
);

router.get('/oauth/failure', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'OAuth authentication failed',
  });
});

export default router;


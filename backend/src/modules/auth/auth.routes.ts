import { Router } from 'express';
import * as authController from './auth.controller';
import { requireAuth } from '../../middlewares/auth';
import passport from 'passport';

const router = Router();


router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/logout', requireAuth, authController.logout);

router.get('/profile', requireAuth, authController.getUserProfile);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  authController.googleCallback
);

export default router;

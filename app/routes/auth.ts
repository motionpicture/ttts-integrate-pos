/**
 * ユーザー認証ルーター
 * @namespace routes.auth
 */

import { Router } from 'express';
import * as authController from '../controllers/auth';

const authRouter = Router();

authRouter.all('/login', authController.login);
authRouter.all('/logout', authController.logout);

export default authRouter;

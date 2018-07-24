"use strict";
/**
 * ユーザー認証ルーター
 * @namespace routes.auth
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController = require("../controllers/auth");
const authRouter = express_1.Router();
authRouter.all('/login', authController.login);
authRouter.all('/logout', authController.logout);
exports.default = authRouter;
//# sourceMappingURL=auth.js.map
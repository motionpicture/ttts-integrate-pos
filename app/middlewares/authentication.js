"use strict";
/**
 * ユーザー認証ミドルウェア
 * @namespace middlewares.authentication
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const user_1 = require("../user");
const debug = createDebug('ttts-backend:middlewares:authentication');
exports.default = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    res.locals.req = req;
    req.masterAdminUser = user_1.default.PARSE(req.session);
    debug('req.masterAdminUser is authenticated?', req.masterAdminUser.isAuthenticated());
    res.locals.loginName = (req.masterAdminUser.isAuthenticated())
        ? `${req.masterAdminUser.familyName} ${req.masterAdminUser.givenName}`
        : '';
    // 既ログインの場合
    if (req.masterAdminUser.isAuthenticated()) {
        next();
        return;
    }
    if (req.xhr) {
        res.json({
            success: false,
            message: 'login required'
        });
    }
    else {
        debug('req.originalUrl', req.originalUrl);
        res.redirect(`/login?cb=${req.originalUrl}`);
    }
});
//# sourceMappingURL=authentication.js.map
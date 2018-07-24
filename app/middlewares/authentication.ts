/**
 * ユーザー認証ミドルウェア
 * @namespace middlewares.authentication
 */

import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';

import MasterAdminUser from '../user';

const debug = createDebug('ttts-backend:middlewares:authentication');

export default async (req: Request, res: Response, next: NextFunction) => {
    res.locals.req = req;
    req.masterAdminUser = MasterAdminUser.PARSE(req.session);
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
    } else {
        debug('req.originalUrl', req.originalUrl);
        res.redirect(`/login?cb=${req.originalUrl}`);
    }
};

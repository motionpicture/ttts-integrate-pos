/**
 * マスタ管理者認証コントローラー
 * @namespace controllers.auth
 */

import * as tttsapi from '@motionpicture/ttts-api-nodejs-client';
import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as request from 'request-promise-native';
import * as _ from 'underscore';

import * as Message from '../../common/Const/Message';

const debug = createDebug('ttts-briswell-develop.scm.azurewebsites.net:master:auth');

/**
 * マスタ管理ログイン
 */
export async function login(req: Request, res: Response): Promise<void> {
    if (req.masterAdminUser !== undefined && req.masterAdminUser.isAuthenticated()) {
        res.redirect('/');

        return;
    }

    let errors: any = {};
    if (req.method === 'POST') {
        // 検証
        validate(req);
        const validatorResult = await req.getValidationResult();
        errors = validatorResult.mapped;

        if (validatorResult.isEmpty()) {
            try {
                // ログイン情報が有効であれば、Cognitoでもログイン
                (<Express.Session>req.session).cognitoCredentials = await request.post(
                    `${process.env.API_ENDPOINT}/oauth/token`,
                    {
                        auth: {
                            user: <string>process.env.API_CLIENT_ID,
                            pass: <string>process.env.API_CLIENT_SECRET
                        },
                        json: true,
                        body: {
                            username: req.body.username,
                            password: req.body.password
                        }
                    }
                ).then((body) => body);
                debug('cognito credentials published.', (<Express.Session>req.session).cognitoCredentials);
            } catch (error) {
                errors = { username: { msg: 'IDもしくはパスワードの入力に誤りがあります' } };
            }

            const cognitoCredentials = (<Express.Session>req.session).cognitoCredentials;
            if (cognitoCredentials !== undefined) {
                // ログイン
                const authClient = new tttsapi.auth.OAuth2({
                    domain: <string>process.env.API_AUTHORIZE_SERVER_DOMAIN,
                    clientId: <string>process.env.API_CLIENT_ID,
                    clientSecret: <string>process.env.API_CLIENT_SECRET
                });
                authClient.setCredentials({
                    refresh_token: cognitoCredentials.refreshToken,
                    // expiry_date: number;
                    access_token: cognitoCredentials.accessToken,
                    token_type: cognitoCredentials.tokenType
                });
                const adminService = new tttsapi.service.Admin({
                    endpoint: <string>process.env.API_ENDPOINT,
                    auth: authClient
                });
                const cognitoUser = await adminService.getProfile();

                // ログイン
                (<Express.Session>req.session).user = cognitoUser;

                const cb = (!_.isEmpty(req.query.cb)) ? req.query.cb : '/';
                res.redirect(cb);

                return;
            }
        }
    }
    
    // ログイン画面遷移
    res.render('master/auth/login', {
        displayId: 'Aa-1',
        title: 'マスタ管理ログイン',
        errors: errors,
        routeName: 'master.login',
        layout: 'layouts/master/layoutLogin'
    });
}

function validate(req: Request): void {
    req.checkBody('username', Message.Common.required.replace('$fieldName$', 'ID')).notEmpty();
    req.checkBody('password', Message.Common.required.replace('$fieldName$', 'パスワード')).notEmpty();
}

/**
 * マスタ管理ログアウト
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session !== undefined) {
            delete req.session.user;
            delete req.session.cognitoCredentials;
        }

        res.redirect('/login');
    } catch (error) {
        next(error);
    }
}

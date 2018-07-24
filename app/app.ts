/**
 * expressアプリケーション
 * @ignore
 */

import * as middlewares from '@motionpicture/express-middleware';
import * as bodyParser from 'body-parser';
import * as favicon from 'serve-favicon';
import * as expressValidator from 'express-validator';
import * as cookieParser from 'cookie-parser';
const expressLayouts = require('express-ejs-layouts');
const express = require("express");

// ミドルウェア
import authentication from './middlewares/authentication';
import errorHandler from './middlewares/errorHandler';
import locals from './middlewares/locals';
import notFoundHandler from './middlewares/notFoundHandler';
import session from './middlewares/session';

// ルーター
import authRouter from './routes/auth';
import reportsRouter from './routes/reports';
import router from './routes/router';

const app = express();

app.use(middlewares.basicAuth({ // ベーシック認証
    name: process.env.BASIC_AUTH_NAME,
    pass: process.env.BASIC_AUTH_PASS
}));

app.use(session); // セッション
app.use(locals); // テンプレート変数

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/layout');

// uncomment after placing your favicon in /public
app.use(favicon(`${__dirname}/../public/favicon.ico`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(`${__dirname}/../public`));
app.use(expressValidator()); // バリデーション

app.use(authRouter); // ログイン・ログアウト
app.use(authentication); // ユーザー認証
app.use(router);
app.use('/reports', reportsRouter); //レポート出力

// 404
app.use(notFoundHandler);

// error handlers
app.use(errorHandler);

export = app;
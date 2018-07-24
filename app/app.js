"use strict";
/**
 * expressアプリケーション
 * @ignore
 */
const middlewares = require("@motionpicture/express-middleware");
const bodyParser = require("body-parser");
const favicon = require("serve-favicon");
const expressValidator = require("express-validator");
const cookieParser = require("cookie-parser");
const expressLayouts = require('express-ejs-layouts');
const express = require("express");
// ミドルウェア
const authentication_1 = require("./middlewares/authentication");
const errorHandler_1 = require("./middlewares/errorHandler");
const locals_1 = require("./middlewares/locals");
const notFoundHandler_1 = require("./middlewares/notFoundHandler");
const session_1 = require("./middlewares/session");
// ルーター
const auth_1 = require("./routes/auth");
const reports_1 = require("./routes/reports");
const router_1 = require("./routes/router");
const app = express();
app.use(middlewares.basicAuth({
    name: process.env.BASIC_AUTH_NAME,
    pass: process.env.BASIC_AUTH_PASS
}));
app.use(session_1.default); // セッション
app.use(locals_1.default); // テンプレート変数
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
app.use(auth_1.default); // ログイン・ログアウト
app.use(authentication_1.default); // ユーザー認証
app.use(router_1.default);
app.use('/reports', reports_1.default); //レポート出力
// 404
app.use(notFoundHandler_1.default);
// error handlers
app.use(errorHandler_1.default);
module.exports = app;
//# sourceMappingURL=app.js.map
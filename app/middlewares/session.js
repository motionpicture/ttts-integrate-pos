"use strict";
/**
 * セッションミドルウェア
 * @namespace middlewares.session
 */
Object.defineProperty(exports, "__esModule", { value: true });
const connectRedis = require("connect-redis");
const session = require("express-session");
const redis = require("redis");
const redisStore = connectRedis(session);
const COOKIE_MAX_AGE = 3600000; // 60 * 60 * 1000(session active 1 hour)
exports.default = session({
    secret: 'ttts-backend-session-secret',
    resave: false,
    // Force a session identifier cookie to be set on every response.
    // The expiration is reset to the original maxAge, resetting the expiration countdown.
    rolling: true,
    saveUninitialized: false,
    store: new redisStore({
        client: redis.createClient({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_KEY,
            tls: { servername: process.env.REDIS_HOST }
        })
    }),
    cookie: {
        maxAge: COOKIE_MAX_AGE
    }
});
//# sourceMappingURL=session.js.map
"use strict";
/**
 * 404ハンドラーミドルウェア
 */
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = require("http-status");
exports.default = (req, res) => {
    res.status(http_status_1.NOT_FOUND).render('error/notFound', {
        message: `router for [${req.originalUrl}] not found.`
    });
};
//# sourceMappingURL=notFoundHandler.js.map
"use strict";
/**
 * エラーコントローラー
 * @namespace controllers.error
 */
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = require("http-status");
function notFound(req, res) {
    res.status(http_status_1.NOT_FOUND).render('error/notFound', {
        message: `router for [${req.originalUrl}] not found.`
    });
}
exports.notFound = notFound;
function badRequest(err, __, res) {
    res.status(http_status_1.BAD_REQUEST).render('error/badRequest', {
        message: err.message
    });
}
exports.badRequest = badRequest;
function internalServerError(res) {
    res.status(http_status_1.INTERNAL_SERVER_ERROR).render('error/internalServerError', {
        message: 'an unexpected error occurred'
    });
}
exports.internalServerError = internalServerError;
//# sourceMappingURL=error.js.map
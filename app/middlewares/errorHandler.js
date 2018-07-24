"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorController = require("../controllers/error");
exports.default = (err, req, res, next) => {
    if (res.headersSent) {
        next(err);
        return;
    }
    // エラーオブジェクトの場合は、キャッチされた例外でクライント依存のエラーの可能性が高い
    if (err instanceof Error) {
        ErrorController.badRequest(err, req, res);
    }
    else {
        ErrorController.internalServerError(res);
    }
};
//# sourceMappingURL=errorHandler.js.map
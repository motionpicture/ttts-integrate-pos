"use strict";
/**
 * テンプレート変数引渡しミドルウェア
 *
 * @module middleware/locals
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (req, res, next) => {
    res.locals.req = req;
    next();
};
//# sourceMappingURL=locals.js.map
"use strict";
/**
 * デフォルトルーター
 * @namespace routes.router
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http_status_1 = require("http-status");
const router = express.Router();
router.get('/', (__, res) => {
    res.redirect(http_status_1.MOVED_PERMANENTLY, '/reports');
});
router.get('/master/report', (__, res) => {
    res.redirect(http_status_1.MOVED_PERMANENTLY, '/reports');
});
exports.default = router;
//# sourceMappingURL=router.js.map
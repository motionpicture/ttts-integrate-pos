"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * レポート出力管理ルーター
 * @namespace routes.reports
 */
const express_1 = require("express");
const reportsController = require("../controllers/reports");
const reportsRouter = express_1.Router();
reportsRouter.get('/sales', (__, res) => {
    res.render('reports/sales', {
        title: '売り上げレポート出力',
        routeName: 'master.report.sales',
        layout: 'layouts/master/layout'
    });
});
reportsRouter.get('/getSales', reportsController.getSales);
exports.default = reportsRouter;
//# sourceMappingURL=reports.js.map
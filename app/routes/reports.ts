/**
 * レポート出力管理ルーター
 * @namespace routes.reports
 */
import { Router } from 'express';
import * as reportsController from '../controllers/reports';

const reportsRouter = Router();

reportsRouter.get('/sales', (__, res) => {
    res.render('reports/sales', {
        title: '売り上げレポート出力',
        routeName: 'master.report.sales',
        layout: 'layouts/master/layout'
    });
});

reportsRouter.get('/getSales', reportsController.getSales);
export default reportsRouter;

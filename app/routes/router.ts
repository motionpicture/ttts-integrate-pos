/**
 * デフォルトルーター
 * @namespace routes.router
 */

import * as express from 'express';
import { MOVED_PERMANENTLY } from 'http-status';

const router = express.Router();

router.get('/', (__: express.Request, res: express.Response) => {
    res.redirect(MOVED_PERMANENTLY, '/reports');
});

router.get('/master/report', (__: express.Request, res: express.Response) => {
    res.redirect(MOVED_PERMANENTLY, '/reports');
});

export default router;

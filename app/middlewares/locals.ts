/**
 * テンプレート変数引渡しミドルウェア
 *
 * @module middleware/locals
 */

import { NextFunction, Request, Response } from 'express';

export default (req: Request, res: Response, next: NextFunction) => {
    res.locals.req = req;

    next();
};

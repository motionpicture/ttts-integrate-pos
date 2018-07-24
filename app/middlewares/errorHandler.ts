/**
 * エラーハンドラーミドルウェア
 *
 * todo errの内容、エラーオブジェクトタイプによって、本来はステータスコードを細かくコントロールするべき
 * 現時点では、雑にコントロールしてある
 */
import { NextFunction, Request, Response } from 'express';

import * as ErrorController from '../controllers/error';

export default (err: any, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        next(err);

        return;
    }

    // エラーオブジェクトの場合は、キャッチされた例外でクライント依存のエラーの可能性が高い
    if (err instanceof Error) {
        ErrorController.badRequest(err, req, res);
    } else {
        ErrorController.internalServerError(res);
    }
};

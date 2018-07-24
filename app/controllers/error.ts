/**
 * エラーコントローラー
 * @namespace controllers.error
 */

import { Request, Response } from 'express';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } from 'http-status';

export function notFound(req: Request, res: Response) {
    res.status(NOT_FOUND).render('error/notFound', {
        message: `router for [${req.originalUrl}] not found.`
    });
}

export function badRequest(err: any, __: Request, res: Response) {
    res.status(BAD_REQUEST).render('error/badRequest', {
        message: err.message
    });
}

export function internalServerError(res: Response) {
    res.status(INTERNAL_SERVER_ERROR).render('error/internalServerError', {
        message: 'an unexpected error occurred'
    });
}

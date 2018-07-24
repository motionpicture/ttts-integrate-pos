import * as express from 'express';
import MasterAdminUser from '../app/user';

declare global {
    namespace Express {

        export interface Request {
            masterAdminUser?: MasterAdminUser;
        }

        interface IUser {
            familyName: string;
            givenName: string;
            email: string;
            telephone: string;
            username: string;
        }

        export interface ICredentials {
            accessToken: string;
            expiresIn: number;
            idToken: string;
            refreshToken: string;
            tokenType: string;
        }

        /**
         * セッションインターフェース
         * セッション管理する値についてはここで型定義すること
         */
        // tslint:disable-next-line:interface-name
        export interface Session {
            user?: IUser;
            cognitoCredentials?: ICredentials;
        }
    }
}

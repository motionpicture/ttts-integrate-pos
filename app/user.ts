/**
 * マスタ管理者ユーザー
 * @export
 * @class MasterAdminUser
 */
export default class MasterAdminUser {
    public familyName: string;
    public givenName: string;
    public email: string;
    public telephone: string;
    public username: string;

    public static PARSE(session: Express.Session | undefined): MasterAdminUser {
        const user = new MasterAdminUser();

        // セッション値からオブジェクトにセット
        if (session !== undefined && session.user !== undefined) {
            user.familyName = session.user.familyName;
            user.givenName = session.user.givenName;
            user.email = session.user.email;
            user.telephone = session.user.telephone;
            user.username = session.user.username;
        }

        return user;
    }

    /**
     * サインイン中かどうか
     */
    public isAuthenticated(): boolean {
        return (this.username !== undefined);
    }
}

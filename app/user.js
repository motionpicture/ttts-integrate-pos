"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * マスタ管理者ユーザー
 * @export
 * @class MasterAdminUser
 */
class MasterAdminUser {
    static PARSE(session) {
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
    isAuthenticated() {
        return (this.username !== undefined);
    }
}
exports.default = MasterAdminUser;
//# sourceMappingURL=user.js.map
export class PasswordForgot {
    public old_password: string;
    public new_password: string;
    public confirm_password: string;
    constructor(old_p, new_p, con_p) {
        this.old_password = old_p;
        this.new_password = new_p;
        this.confirm_password = con_p;
    }
}
export class User {
    public id: number;
    public first_name: string;
    public last_name: string;
    public full_name: string;
    public email: string;
    public password: string;
    constructor(id, f_name, l_name, em, passw) {
        this.id = id;
        this.first_name = f_name;
        this.last_name = l_name;
        this.full_name = this.first_name+''+this.last_name;
        this.email = em;
        this.password = passw;
    }
}

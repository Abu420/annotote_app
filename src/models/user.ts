export class User {
    public id: number;
    public firstName: string;
    public lastName: string;
    public full_name: string;
    public email: string;
    public password: string;
    public access_token: string;
    public createdAt: string;
    public description: string;
    public photo: string;
    public platform: string;
    public platformId: string;
    public rememberToken: string;
    public updatedAt: string;
    public tutorial_status: string;

    public verified: string;
    constructor(id, f_name, l_name, em, passw, photo = null) {
        this.id = id;
        this.firstName = f_name;
        this.lastName = l_name;
        this.full_name = this.firstName + ' ' + this.lastName;
        this.email = em;
        this.password = passw;
        this.photo = photo;
    }
}

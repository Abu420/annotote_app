/**
 * Created by Bilal Akmal on 02/06/2017.
 */
import { Injectable } from '@angular/core';
import { User } from "../models/user";

@Injectable()
export class Constants {

	public API_BASEURL: string = "http://139.162.37.73/anotote/api";
	public AUTHORIZATION_HEADER: string = "$2y$10$XLoU25gEWjCk/iDgJpHHcekPts9Shfn3hyJvrzOFFpY2zeg/kedeC";

}

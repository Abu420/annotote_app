import {ListTotesAnototeModel} from "./ListTotesAnototeModel";
/**
 * Created by nomantufail on 30/05/2017.
 */
export class ListTotesUserToteModel{
  public id:number = 0;
  public anotote:ListTotesAnototeModel = null;
  public constructor(id, anotote){
    this.id = id;
    this.anotote = anotote;
  }
}

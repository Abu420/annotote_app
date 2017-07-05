/**
 * Created by nomantufail on 30/05/2017.
 */
export class ListTotesAnototeModel{
  public id:number = 0;
  public title:string = "";
  public source:string = "";
  public photo:string = "";
  public constructor(id, title, source, photo){
    this.id = id;
    this.title = title;
    this.source = source;
    this.photo = photo;
  }
}

/**
 * Created by Bilal Akmal on 02/06/2017.
 */
import { Injectable } from "@angular/core";
import { User } from "../models/user";

@Injectable()
export class Constants {

  private domain_url: string = "139.162.37.73"
  private local: string = "139.162.37.73"
  public API_BASEURL: string = "http://" + this.domain_url + "/anotote/api";
  public SEARCH_API_BASEURL: string = "http://" + this.domain_url + ":8983/solr/annotote";
  public IMAGE_BASEURL: string = "http://" + this.domain_url + "/anotote";
  public PROXY_SERVER: string = "http://138.68.229.113:8080/"
  // public API_BASEURL: string = "http://"+this.domain_url+"/anotote/api";
  // public SEARCH_API_BASEURL: string = "http://"+this.domain_url+":8983/solr/annotote";
  // public IMAGE_BASEURL: string = "http://"+this.domain_url+"/anotote";
  public AUTHORIZATION_HEADER: string = "$2y$10$XLoU25gEWjCk/iDgJpHHcekPts9Shfn3hyJvrzOFFpY2zeg/kedeC";
  public HYPOTHESIS_SCRAPPING_BASEURL = "http://138.68.229.113:9508/getReadableDirect?url=";
  // public HYPOTHESIS_SCRAPPING_BASEURL = "http://138.68.229.113:8000/scrapper/map/2/";
  // public HYPOTHESIS_SCRAPPING_BASEURL = "http://138.68.229.113/healingbudz/api/scrape?url=";
  public iframe_baseurl = "http://" + this.domain_url + "/anotote/public/users_annototes/";
}

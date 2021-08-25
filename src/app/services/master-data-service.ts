import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {WebServices} from './web-services';
import {Observable} from 'rxjs';


@Injectable()
export class MasterDataService {

  constructor(private web: WebServices) {
  }

  public getMasterDataRows(): Observable<any> {
    return this.web.httpGet(`${environment.baseServiceUrl}/v1/masterDataRows`);
  }
}

import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {WebServices} from './web-services';
import {Observable} from 'rxjs';
import {Carrier} from '../models/master-data-models/carrier-model';
import {CarrierModeCode} from '../models/master-data-models/carrier-mode-code-model';
import {ServiceLevel} from '../models/master-data-models/service-level-model';


@Injectable()
export class MasterDataService {

  constructor(private web: WebServices) {
  }

  public getMasterDataRows(): Observable<any> {
    return this.web.httpGet(`${environment.baseServiceUrl}/v1/masterDataRows`);
  }

  public checkCompanyCode(companyCode: string): Observable<any> {
    return this.web.httpGet(`${environment.baseServiceUrl}/v1/companyCode/${companyCode}`);
  }

  public getCarriers(): Observable<Array<Carrier>> {
    return this.getAllOfMasterDataType('carriers');
  }

  public getCarrierModeCodes(): Observable<Array<CarrierModeCode>> {
    return this.getAllOfMasterDataType('carrierModeCodes');
  }

  public getServiceLevels(): Observable<Array<ServiceLevel>> {
    return this.getAllOfMasterDataType('serviceLevels');
  }

  private getAllOfMasterDataType(masterDataType: string): Observable<Array<any>> {
    return this.web.httpGet(`${environment.baseServiceUrl}/v1/${masterDataType}`);
  }

}

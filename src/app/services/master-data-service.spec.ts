import {fakeAsync, TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';
import {WebServices} from './web-services';
import {MasterDataService} from './master-data-service';
import {of} from 'rxjs';
import {FalconTestingModule} from '../testing/falcon-testing.module';
import {MasterDataRow} from '../models/master-data-row/master-data-row';
import {environment} from '../../environments/environment';

describe('MasterDataService', () => {
  let http: HttpTestingController;
  let web: WebServices;
  let masterDataService: MasterDataService;
  let masterDataRows: Array<MasterDataRow>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FalconTestingModule],
    });
    http = TestBed.inject(HttpTestingController);
    web = TestBed.inject(WebServices);
    masterDataService = TestBed.inject(MasterDataService);
    masterDataRows = [
      {
        label: 'Business Units',
        lastUpdated: '1970-01-01T10:00:00.000+0000',
        endpoint: 'businessUnits',
        hasDownloadableTemplate: true
      }
    ];
  });

  afterEach(() => {
    http.verify();
  });

  describe('#getBusinessUnit', () => {
    it('should return businessUnit', fakeAsync(() => {
      spyOn(web, 'httpGet').and.returnValue(of(masterDataRows));
      const result = masterDataService.getMasterDataRows().toPromise();
      expect(result).toBeTruthy();
      expect(web.httpGet).toHaveBeenCalled();
    }));
  });

  describe('#checkCompanyCode', () => {
    it('should return response code', fakeAsync(() => {
      const companyCode = 'Test';
      spyOn(web, 'httpGet').and.returnValue(of(companyCode));
      const result = masterDataService.checkCompanyCode(companyCode).toPromise();
      expect(result).toBeTruthy();
      expect(web.httpGet).toHaveBeenCalled();
    }));
  });

  describe('#getCarrierScac', () => {
    it('should call api', async () => {
      spyOn(web, 'httpGet').and.returnValue(of([]));
      const carriers = await masterDataService.getCarrierSCACs().toPromise();
      expect(carriers).toEqual([]);
      expect(web.httpGet).toHaveBeenCalledWith(`${environment.baseServiceUrl}/v1/carrierSCACs`);
    });
  });

  describe('#getCarriers', () => {
    it('should call api', async () => {
      spyOn(web, 'httpGet').and.returnValue(of([]));
      const carriers = await masterDataService.getCarriers().toPromise();
      expect(carriers).toEqual([]);
      expect(web.httpGet).toHaveBeenCalledWith(`${environment.baseServiceUrl}/v1/carriers`);
    });
  });

  describe('#getCarrierModeCodes', () => {
    it('should call api', async () => {
      spyOn(web, 'httpGet').and.returnValue(of([]));
      const carrierModes = await masterDataService.getCarrierModeCodes().toPromise();
      expect(carrierModes).toEqual([]);
      expect(web.httpGet).toHaveBeenCalledWith(`${environment.baseServiceUrl}/v1/carrierModeCodes`);
    });
  });

  describe('#getServiceLevels', () => {
    it('should call api', async () => {
      spyOn(web, 'httpGet').and.returnValue(of([]));
      const serviceLevels = await masterDataService.getServiceLevels().toPromise();
      expect(serviceLevels).toEqual([]);
      expect(web.httpGet).toHaveBeenCalledWith(`${environment.baseServiceUrl}/v1/serviceLevels`);
    });
  });

  describe('#getCarrierDetails', () => {
    it('should call api', async () => {
      spyOn(web, 'httpGet').and.returnValue(of([]));
      const serviceLevels = await masterDataService.getCarrierDetails().toPromise();
      expect(serviceLevels).toEqual([]);
      expect(web.httpGet).toHaveBeenCalledWith(`${environment.baseServiceUrl}/v1/carrierDetails`);
    });
  });

});

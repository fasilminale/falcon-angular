import {TestBed} from '@angular/core/testing';
import {WebServices} from './web-services';
import {of} from 'rxjs';
import {FalconTestingModule} from '../testing/falcon-testing.module';
import {RateService} from './rate-service';
import {RateEngineRequest, RateDetailResponse, RatesResponse} from '../models/rate-engine/rate-engine-request';
import {InvoiceDataModel} from '../models/invoice/invoice-model';
import {InvoiceAmountDetail} from '../models/invoice/invoice-amount-detail-model';

describe('RateService', () => {

  let rateService: RateService;
  let web: WebServices;
  let request: RateEngineRequest;
  let rateResponse: RatesResponse;
  let detailResponse: RateDetailResponse;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FalconTestingModule],
    });
    web = TestBed.inject(WebServices);
    rateService = new RateService(web);
    rateResponse = {
      mode: 'LTL',
      carrierRateSummaries: [{
        totalCost: '0',
        scac: 'ODFL',
        legs: [
          {
            carrierRate: {
              accessorialList: [],
              lineItems: [
                {
                  description: 'TST - TestChargeCode',
                  rate: '100',
                  rateType: 'FLAT',
                  lineItemTotal: '100',
                  lineItemType: 'ACCESSORIAL',
                  runningTotal: '100',
                  step: '1',
                  costName: 'TestCostName',
                  quantity: 0,
                  message: '',
                  accessorial: true
                }
              ]
            }
          }
        ]
      }]
    };

    detailResponse = {
      mode: 'TL',
      scac: 'OWEL',
      shipDate: '2022-04-02',
      origin: {
        streetAddress: '392 Poling Farm Road',
        locCode: '',
        city: 'Norfolk',
        state: 'NE',
        zip: '68701',
        country: 'US'
      },
      destination: {
        streetAddress: '4018 Murphy Court',
        locCode: '',
        city: 'Riverside',
        state: 'CA',
        zip: '92507',
        country: 'US'
      },
      calcDetails: [
        {
          accessorialCode: '405',
          name: 'Fuel Surcharge - Miles'
        }
      ]
    };

    request = {
      mode: '',
      scac: '',
      shipDate: new Date().toISOString(),
      origin: {
        streetAddress: '',
        locCode: '',
        city: '',
        state: '',
        zip: '',
        country: ''
      },
      destination: {
        streetAddress: '',
        locCode: '',
        city: '',
        state: '',
        zip: '',
        country: ''
      },
      accessorialCodes: ['accessorialCode'],
      invoice: new InvoiceDataModel()
    };
  });

  it('should create', () => {
    expect(rateService).toBeTruthy();
  });

  it('should NOT be duplicate from matching falconInvoiceNumber', async () => {
    spyOn(web, 'httpPost').and.returnValue(of(detailResponse));
    const response = await rateService.getAccessorialDetails(request).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
    expect(response.mode).toEqual('TL');
  });

  it('should be duplicate if missing falconInvoiceNumber', async () => {
    spyOn(web, 'httpPost').and.returnValue(of(rateResponse));
    const response = await rateService.getRates(request).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
    expect(response.mode).toEqual('LTL');
  });

  it('rateInvoice should call web service', async () => {
    spyOn(web, 'httpPost').and.returnValue(of(new InvoiceDataModel()));
    const response = await rateService.rateInvoice(new InvoiceDataModel()).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
    expect(response).toBeTruthy();
  });

  it('should call glAllocation endpoint', async () => {
    spyOn(web, 'httpPost').and.returnValue(of(new InvoiceDataModel()));
    const response = await rateService.glAllocateInvoice(new InvoiceDataModel()).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
    expect(response).toBeTruthy();
  });

  it('should call adjustWeight endpoint', async () => {
    spyOn(web, 'httpPost').and.returnValue(of(new InvoiceDataModel()));
    const response = await rateService.adjustWeightOnInvoice(new InvoiceDataModel(), 500).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
    expect(response).toBeTruthy();
  });

  it('updateInvoice should call web service', async () => {
    spyOn(web, 'httpPut').and.returnValue(of(new InvoiceDataModel()));
    const response = await rateService.updateInvoice(new InvoiceDataModel());
    expect(web.httpPut).toHaveBeenCalled();
    expect(response).toBeTruthy();
  });

});

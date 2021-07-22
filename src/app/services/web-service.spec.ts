import {TestBed} from '@angular/core/testing';
import {WebServices} from './web-services';
import {HttpTestingController,} from '@angular/common/http/testing';
import {FalconTestingModule} from '../testing/falcon-testing.module';
import {HttpClient} from '@angular/common/http';

describe('WebService Tests', () => {

  const TEST_URL = 'test_url';
  const TEST_BODY = 'test_body';
  const TEST_RESPONSE = 'test_response';

  let http: HttpTestingController;
  let web: WebServices;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FalconTestingModule],
    });
    http = TestBed.inject(HttpTestingController);
    web = new WebServices(TestBed.inject(HttpClient));
  });

  afterEach(() => {
    http.verify();
  });

  it('should GET', async () => {
    const promise = web.httpGet(TEST_URL).toPromise();
    const req = http.expectOne(TEST_URL);
    req.flush(TEST_RESPONSE);
    const response = await promise;
    expect(req.request.method).toEqual('GET');
    expect(req.request.body).toBeNull();
    expect(response).toEqual(TEST_RESPONSE);
  });

  it('should POST with body', async () => {
    const promise = web.httpPost(TEST_URL, TEST_BODY).toPromise();
    const req = http.expectOne(TEST_URL);
    req.flush(TEST_RESPONSE);
    const response = await promise;
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(TEST_BODY);
    expect(response).toEqual(TEST_RESPONSE);
  });

  it('should POST without body', async () => {
    const promise = web.httpPost(TEST_URL).toPromise();
    const req = http.expectOne(TEST_URL);
    req.flush(TEST_RESPONSE);
    const response = await promise;
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual('');
    expect(response).toEqual(TEST_RESPONSE);
  });

  it('should PUT with body', async () => {
    const promise = web.httpPut(TEST_URL, TEST_BODY).toPromise();
    const req = http.expectOne(TEST_URL);
    req.flush(TEST_RESPONSE);
    const response = await promise;
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(TEST_BODY);
    expect(response).toEqual(TEST_RESPONSE);
  });

  it('should PUT without body', async () => {
    const promise = web.httpPut(TEST_URL).toPromise();
    const req = http.expectOne(TEST_URL);
    req.flush(TEST_RESPONSE);
    const response = await promise;
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual('');
    expect(response).toEqual(TEST_RESPONSE);
  });

  it('should DELETE', async () => {
    const promise = web.httpDelete(TEST_URL).toPromise();
    const req = http.expectOne(TEST_URL);
    req.flush(TEST_RESPONSE);
    const response = await promise;
    expect(req.request.method).toEqual('DELETE');
    expect(req.request.body).toBeNull();
    expect(response).toEqual(TEST_RESPONSE);
  });

});

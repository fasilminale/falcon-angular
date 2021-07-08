import {TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';
import {OktaAuthService, OKTA_CONFIG} from '@okta/okta-angular';
import {HttpClient, HttpHeaders, HTTP_INTERCEPTORS} from '@angular/common/http';
import {FalHttpInterceptor} from './fal-http-interceptor';
import {FalconTestingModule} from '../testing/falcon-testing.module';

describe('HttpInterceptor', () => {

  const TEST_URL = '/test';
  const TEST_RESPONSE = 'test response';

  let oktaAuth: OktaAuthService;
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  const oktaConfig = {
    issuer: 'https://not-real.okta.com',
    clientId: 'fake-client-id',
    redirectUri: 'http://localhost:4200'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      providers: [
        {provide: HTTP_INTERCEPTORS, useClass: FalHttpInterceptor, multi: true},
        {provide: OKTA_CONFIG, useValue: oktaConfig}
      ],
    });
    oktaAuth = TestBed.inject(OktaAuthService);
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('test header Authorization', async () => {
    const headers = new HttpHeaders().set('X-SKIP-INTERCEPTOR', '');
    const promise = httpClient.get(TEST_URL, {headers}).toPromise();
    const req = httpMock.expectOne(TEST_URL);
    req.flush(TEST_RESPONSE);
    const response = await promise;
    expect(req.request.method).toEqual('GET');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.body).toBeNull();
    expect(response).toEqual(TEST_RESPONSE);
  });

  it('test header Authorization error', async () => {
    const promise = httpClient.get(TEST_URL).toPromise();
    const req = httpMock.expectOne(TEST_URL);
    req.error(new ErrorEvent('error'));
    let wasError: boolean;
    try {
      await promise;
      wasError = false;
    } catch (e) {
      wasError = true;
    }
    expect(req.request.method).toEqual('GET');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.body).toBeNull();
    expect(wasError).toBeTrue();
  });

});

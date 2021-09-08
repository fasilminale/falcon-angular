import {TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';
import {OktaAuthService, OKTA_CONFIG} from '@okta/okta-angular';
import {HttpClient, HTTP_INTERCEPTORS} from '@angular/common/http';
import {FalHttpInterceptor} from './fal-http-interceptor';
import {FalconTestingModule} from '../testing/falcon-testing.module';
import {ErrorService} from './error-service';
import {LoadingService} from './loading-service';

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
    const promise = httpClient.get(TEST_URL).toPromise();
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

  describe('when extract message is called', () => {
    const OUTER_MSG = 'outer message';
    const INNER_MSG = 'inner message';
    const NESTED_MSG = 'nested inner message';
    let httpInterceptor: FalHttpInterceptor;
    beforeEach(() => {
      httpInterceptor = new FalHttpInterceptor(
        TestBed.inject(ErrorService),
        oktaAuth,
        TestBed.inject(LoadingService)
      );
    });
    it('where input has nothing, should return N/A', () => {
      const input = {};
      const result = httpInterceptor.extractMessage(input);
      expect(result).toEqual('N/A');
    });
    it('where input has only outer message, should return outer message', () => {
      const input = {message: OUTER_MSG};
      const result = httpInterceptor.extractMessage(input);
      expect(result).toEqual(OUTER_MSG);
    });
    it('where input has only inner message, should return inner message', () => {
      const input = {error: {message: INNER_MSG}};
      const result = httpInterceptor.extractMessage(input);
      expect(result).toEqual(INNER_MSG);
    });
    it('where input has only nested message, should return nested message', () => {
      const input = {error: {error: {message: NESTED_MSG}}};
      const result = httpInterceptor.extractMessage(input);
      expect(result).toEqual(NESTED_MSG);
    });
    it('where input has outer, inner, and nested messages, should return nested message', () => {
      const input = {
        message: OUTER_MSG,
        error: {
          message: INNER_MSG,
          error: {
            message: NESTED_MSG
          }
        }
      };
      const result = httpInterceptor.extractMessage(input);
      expect(result).toEqual(NESTED_MSG);
    });
    it('where input has all outer and inner messages, should return inner message', () => {
      const input = {
        message: OUTER_MSG,
        error: {
          message: INNER_MSG,
        }
      };
      const result = httpInterceptor.extractMessage(input);
      expect(result).toEqual(INNER_MSG);
    });
  });

});

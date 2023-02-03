import {TestBed} from '@angular/core/testing';
import {WebServices} from './web-services';
import {HttpTestingController,} from '@angular/common/http/testing';
import {FalconTestingModule} from '../testing/falcon-testing.module';
import {HttpClient} from '@angular/common/http';
import {WebSocketService} from './web-socket-service';
import {UserService} from './user-service';
import {EnvironmentService} from './environment-service/environment-service';
import {InvoiceService} from './invoice-service';
import {FormBuilder} from '@angular/forms';

describe('WebSocket Tests', () => {

  let http: HttpTestingController;
  let webSocketService: WebSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      providers: [
        FormBuilder,

      ]
    });
    http = TestBed.inject(HttpTestingController);
    webSocketService = new WebSocketService(TestBed.inject(UserService), TestBed.inject(EnvironmentService));
  });

  afterEach(() => {
    http.verify();
  });

  it('should connect', async () => {
    webSocketService.stompClient = {
      connect: () => {}
    }
    http.expectOne("https://somedomain.com/v1/user/info");
    webSocketService.connect("/user/someemail/queue/notification");
  });

  it('should disconnect', async () => {
    webSocketService.stompClient = {
      disconnect: () => {}
    }
    http.expectOne("https://somedomain.com/v1/user/info");
    webSocketService.disconnect();
  });

  it('should handle error', async () => {
    http.expectOne("https://somedomain.com/v1/user/info");
    webSocketService.errorCallBack({});
  });

  it('should receive message', () => {
    http.expectOne("https://somedomain.com/v1/user/info");
    webSocketService.onMessageReceived("TEST");
  });
});

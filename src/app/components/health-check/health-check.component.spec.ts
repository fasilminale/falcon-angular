import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HealthCheckComponent} from './health-check.component';
import {WebServices} from '../../services/web-services';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {environment} from '../../../environments/environment';
import {HttpResponse} from '@angular/common/http';

describe('HealthCheckComponent', () => {
  let component: HealthCheckComponent;
  let fixture: ComponentFixture<HealthCheckComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [HealthCheckComponent],
      providers: [WebServices]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle passing health check', () => {
    component.callHealthCheck();
    http.expectOne(`${environment.baseServiceUrl}/v1/health`)
      .flush(new HttpResponse<never>());
    expect(component.status).toBe('PASS');
  });

  it('should handle failing health check', () => {
    component.callHealthCheck();
    http.expectOne(`${environment.baseServiceUrl}/v1/health`)
      .error(new ErrorEvent('test error event'), {
        status: 123,
        statusText: 'test status text'
      });
    expect(component.status).toBe('FAIL (123: test status text)');
  });

});

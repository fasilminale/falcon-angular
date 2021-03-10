import {ComponentFixture, TestBed} from '@angular/core/testing';

import {InvoiceCreatePageComponent} from './invoice-create-page.component';
import {WebServices} from '../../services/web-services';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HealthCheckComponent} from '../../components/health-check/health-check.component';
import {environment} from '../../../environments/environment';
import {HttpResponse} from '@angular/common/http';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

describe('InvoiceCreatePageComponent', () => {
  let component: InvoiceCreatePageComponent;
  let fixture: ComponentFixture<InvoiceCreatePageComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
      declarations: [InvoiceCreatePageComponent],
      providers: [WebServices, MatSnackBar]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceCreatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should post on submit', () => {
    component.onSubmit();
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice`)
      .flush(new HttpResponse<never>());
  });


});

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {InvoiceDetailPageComponent} from './invoice-detail-page.component';
import {WebServices} from '../../services/web-services';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {environment} from '../../../environments/environment';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {of} from 'rxjs';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {LoadingService} from '../../services/loading-service';

describe('InvoiceDetailPageComponent', () => {
  const invoiceResponse = {
    falconInvoiceNumber: 'F0000000001',
    amountOfInvoice: 2999.99,
    attachments: [
      {
        file: {
          name: 'test'
        }
      }
    ],
    milestones: [],
    lineItems: [
      {
        lineItemNetAmount: 2999.99
      }
    ]
  };

  let component: InvoiceDetailPageComponent;
  let fixture: ComponentFixture<InvoiceDetailPageComponent>;
  let http: HttpTestingController;
  let snackBar: MatSnackBar;
  let activatedRoute: ActivatedRoute;
  let loadingService: LoadingService;

  const route = {
    snapshot: {url: [{path: 'invoice'}, {path: 'F0000000001'}]},
    paramMap: of(convertToParamMap({falconInvoiceNumber: 'F0000000001'}))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule, NoopAnimationsModule, MatDialogModule],
      declarations: [InvoiceDetailPageComponent],
      providers: [WebServices, LoadingService, MatSnackBar,
        { provide: ActivatedRoute, useValue: route }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    snackBar = TestBed.inject(MatSnackBar);
    loadingService = TestBed.inject(LoadingService);
    activatedRoute = TestBed.inject(ActivatedRoute);
    fixture = TestBed.createComponent(InvoiceDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne(`${environment.baseServiceUrl}/v1/invoice/F0000000001`).flush(invoiceResponse);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should load data after loading the page', () => {
    spyOn(component, 'loadData').and.stub();
    component.loadData();
    expect(component.loadData).toHaveBeenCalled();
  });

  it('should toggle the milestones sidenav', () => {
    component.toggleMilestones();
    expect(component.milestonesTabOpen).toBeTrue();
  });
});

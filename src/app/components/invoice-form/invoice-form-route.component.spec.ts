import {ComponentFixture, TestBed} from '@angular/core/testing';

import {InvoiceFormComponent} from './invoice-form.component';
import {of} from 'rxjs';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {WebServices} from '../../services/web-services';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {environment} from '../../../environments/environment';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {LoadingService} from '../../services/loading-service';
import {RouterTestingModule} from '@angular/router/testing';
import {ApiService} from '../../services/api-service';
import {UtilService} from '../../services/util-service';

describe('InvoiceFormComponent ROUTING', () => {
  let component: InvoiceFormComponent;
  let fixture: ComponentFixture<InvoiceFormComponent>;

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

  let http: HttpTestingController;
  let snackBar: MatSnackBar;
  let dialog: MatDialog;

  const route = {
    snapshot: {url: [{path: 'invoice'}, {path: 'F0000000001'}]},
    paramMap: of(convertToParamMap({falconInvoiceNumber: 'F0000000001'}))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        MatDialogModule
      ],
      declarations: [InvoiceFormComponent],
      providers: [
        WebServices,
        MatSnackBar,
        MatDialog,
        LoadingService,
        MatSnackBar,
        ApiService,
        UtilService,
        {provide: ActivatedRoute, useValue: route}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    snackBar = TestBed.inject(MatSnackBar);
    dialog = TestBed.inject(MatDialog);
    fixture = TestBed.createComponent(InvoiceFormComponent);
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
    spyOn(component, 'toggleSidenav').and.callThrough();
    component.toggleSidenav();
    expect(component.toggleSidenav).toHaveBeenCalled();
  });
});

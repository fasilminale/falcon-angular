/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';

import { ManageMyTemplatesComponent } from './manage-my-templates.component';
import { ApiService } from 'src/app/services/api-service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { WebServices } from 'src/app/services/web-services';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { UtilService } from 'src/app/services/util-service';
import { MatDialogModule } from '@angular/material/dialog';
import { Template } from 'src/app/models/template/template-model';

describe('ManageMyTemplatesComponent', () => {
  let component: ManageMyTemplatesComponent;
  let fixture: ComponentFixture<ManageMyTemplatesComponent>;
  let apiService: ApiService;
  let webservice: WebServices;
  let http: HttpTestingController;

  let template: Template = new Template({
    description: '',
    name:'test',
    isDisable: true,
    createdDate: '',
    lineItems: [
      {
        companyCode: '',
        costCenter: '',
        glAccount: '',
        lineItemNumber: '',
      }
    ]
  });
  let templateData = [
    {
      description: '',
      name:'',
      isDisable: true,
      createdDate: '',
    }
  ]

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule, NoopAnimationsModule, MatDialogModule],
      declarations: [ ManageMyTemplatesComponent ],
      providers: [ApiService, WebServices, UtilService],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageMyTemplatesComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    webservice = TestBed.inject(WebServices);
    apiService = TestBed.inject(ApiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get table data',  fakeAsync(() => {
    //component.ngOnInit();
    http.expectOne(`${environment.baseServiceUrl}/v1/templates`).flush(templateData);
    tick();
    expect(component.templates.length).toEqual(1);
  }));

  it('should edit template',  fakeAsync(() => {
    component.editTemplate(template);
    const isDisable = template.isDisable;
    expect(isDisable).toBeFalse();
    tick(1500);
    component.editTemplate(template);
    const req = http.expectOne(`${environment.baseServiceUrl}/v1/template/${template.name}`);
    expect(req.request.method).toBe('PUT');
  }));

  it('should cancel edit template',  fakeAsync(() => {
    template.isDisable = false;
    component.cancelTemplate(template);
    const isDisable = template.isDisable;
    expect(isDisable).toBeTruthy();
  }));
});

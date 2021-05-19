/* tslint:disable:no-unused-variable */
import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

import {ManageMyTemplatesComponent} from './manage-my-templates.component';
import {ApiService} from 'src/app/services/api-service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {environment} from 'src/environments/environment';
import {WebServices} from 'src/app/services/web-services';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {UtilService} from 'src/app/services/util-service';
import {MatDialogModule} from '@angular/material/dialog';
import {Template} from 'src/app/models/template/template-model';
import {of, throwError} from 'rxjs';
import { MatTableModule } from '@angular/material/table';

describe('ManageMyTemplatesComponent', () => {
  let component: ManageMyTemplatesComponent;
  let fixture: ComponentFixture<ManageMyTemplatesComponent>;
  let apiService: ApiService;
  let webservice: WebServices;
  let util: UtilService;
  let http: HttpTestingController;

  let template: Template = new Template({
    description: '',
    name: 'test',
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
      name: '',
      isDisable: true,
      createdDate: '',
    }
  ];
  let updatedTemplate: Template = new Template({
    description: 'test',
    name: 'test',
    isDisable: true,
    createdDate: '2021-01-01'
  });
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule, NoopAnimationsModule, MatDialogModule, MatTableModule],
      declarations: [ManageMyTemplatesComponent],
      providers: [ApiService, WebServices, UtilService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageMyTemplatesComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    webservice = TestBed.inject(WebServices);
    apiService = TestBed.inject(ApiService);
    util = TestBed.inject(UtilService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get table data', fakeAsync(() => {
    //component.ngOnInit();
    http.expectOne(`${environment.baseServiceUrl}/v1/templates`).flush(templateData);
    tick();
    expect(component.templates.length).toEqual(1);
  }));

  it('should enable edit template', fakeAsync(() => {
    component.editTemplate(template);
    const isDisable = template.isDisable;
    expect(isDisable).toBeFalse();

  }));

  it('should update template', () => {
    template.isDisable = false;
    spyOn(util, 'openSnackBar').and.stub();
    const spy = spyOn(apiService, 'updateTemplate').and.returnValue(of(updatedTemplate));
    component.updateTemplate(template);
    const createdDate = template.createdDate;
    expect(createdDate).toEqual(updatedTemplate.createdDate);
    expect(util.openSnackBar).toHaveBeenCalledWith(`Success! Template has been updated.`);
  });


  it('should update template failed', () => {
    template.isDisable = false;
    spyOn(util, 'openSnackBar').and.stub();
    spyOn(apiService, 'updateTemplate').and.returnValue(throwError({status: 404}));
    component.updateTemplate(template);
    expect(util.openSnackBar).toHaveBeenCalledWith(`Failure! Template has been failed.`);
  });

  it('should update template failed with error code 422', () => {
    template.isDisable = false;
    spyOn(util, 'openSnackBar').and.stub();
    spyOn(apiService, 'updateTemplate').and.returnValue(throwError({status: 422}));
    component.updateTemplate(template);
    const isError = template.isError;
    expect(isError).toBeTruthy();
  });
  it('should not update for invalid name', () => {
    template.isDisable = false;
    template.name = '';
    spyOn(util, 'openSnackBar').and.stub();
    spyOn(apiService, 'updateTemplate').and.returnValue(throwError({status: 404}));
    component.updateTemplate(template);
    expect(util.openSnackBar).toHaveBeenCalledTimes(0);
  });
  it('should cancel edit template', fakeAsync(() => {
    template.isDisable = false;
    component.cancelTemplate(template);
    const isDisable = template.isDisable;
    expect(isDisable).toBeTruthy();
  }));
});

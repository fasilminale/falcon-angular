import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ManageMyTemplatesComponent} from './manage-my-templates.component';
import {TemplateService} from 'src/app/services/template-service';
import {HttpTestingController} from '@angular/common/http/testing';
import {environment} from 'src/environments/environment';
import {RouterTestingModule} from '@angular/router/testing';
import {UtilService} from 'src/app/services/util-service';
import {MatDialog} from 'node_modules/@elm/elm-styleguide-ui/node_modules/@angular/material/dialog';
import {Template} from 'src/app/models/template/template-model';
import {of, throwError} from 'rxjs';
import {MatTableModule} from '@angular/material/table';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {ToastService} from '@elm/elm-styleguide-ui';

describe('ManageMyTemplatesComponent', () => {
  const updatedTemplate: Template = new Template({
    description: 'test',
    name: 'test',
    isDisable: true,
    createdDate: '2021-01-01'
  });
  const MOCK_CONFIRM_DIALOG = jasmine.createSpyObj({
    afterClosed: of(true),
    close: null
  });

  let component: ManageMyTemplatesComponent;
  let fixture: ComponentFixture<ManageMyTemplatesComponent>;
  let apiService: TemplateService;
  let util: UtilService;
  let toast: ToastService;
  let http: HttpTestingController;
  let dialog: MatDialog;
  let template: Template;
  let templateData: Template[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FalconTestingModule,
        RouterTestingModule,
        MatTableModule
      ],
      declarations: [ManageMyTemplatesComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ManageMyTemplatesComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    apiService = TestBed.inject(TemplateService);
    util = TestBed.inject(UtilService);
    toast = TestBed.inject(ToastService);
    spyOn(toast, 'openSuccessToast').and.stub();
    spyOn(toast, 'openErrorToast').and.stub();
    dialog = TestBed.inject(MatDialog);
    fixture.detectChanges();
    template = new Template({
      templateId: '1',
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
    templateData = [
      template,
      new Template({
        templateId: '2',
        description: '',
        name: '',
        isDisable: true,
        createdDate: '',
      })
    ];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get table data', fakeAsync(() => {
    http.expectOne(`${environment.baseServiceUrl}/v1/templates`).flush(templateData);
    tick();
    expect(component.templates.length).toEqual(2);
  }));

  it('should enable edit template', fakeAsync(() => {
    component.editTemplate(template);
    const isDisable = template.isDisable;
    expect(isDisable).toBeFalse();
  }));

  it('should not enable edit template, if another template is already editing', fakeAsync(() => {
    component.editedTemplate = templateData[1];
    component.editTemplate(template);
    expect(component.editedTemplate).toEqual(templateData[0]);
  }));

  it('should update template', () => {
    template.isDisable = false;
    spyOn(apiService, 'updateTemplate').and.returnValue(of(updatedTemplate));
    component.updateTemplate(template);
    const createdDate = template.createdDate;
    expect(createdDate).toEqual(updatedTemplate.createdDate);
    expect(toast.openSuccessToast).toHaveBeenCalledWith(
      `Success! Template has been updated.`
    );
  });

  it('should update template failed', () => {
    template.isDisable = false;
    spyOn(apiService, 'updateTemplate').and.returnValue(throwError({status: 404}));
    component.updateTemplate(template);
    expect(toast.openErrorToast).toHaveBeenCalledWith(
      `Failure! Template not saved.`
    );
  });

  it('should update template failed with error code 422', () => {
    template.isDisable = false;
    spyOn(apiService, 'updateTemplate').and.returnValue(throwError({status: 422}));
    component.updateTemplate(template);
    const isError = template.isError;
    expect(isError).toBeTruthy();
  });

  it('should not update for invalid name', () => {
    template.isDisable = false;
    template.name = '';
    spyOn(apiService, 'updateTemplate').and.returnValue(throwError({status: 404}));
    component.updateTemplate(template);
    // TODO write better expectations for this test...
    expect(toast.openSuccessToast).not.toHaveBeenCalled();
    expect(toast.openErrorToast).not.toHaveBeenCalled();
  });

  it('should cancel edit template', fakeAsync(() => {
    template.isDisable = false;
    component.cancelTemplate(template);
    expect(template.isDisable).toBeTrue();
  }));

  it('should delete template from list on confirmation', () => {
    component.templates = templateData;
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    spyOn(apiService, 'deleteTemplate').and.returnValue(of({status: 200}));
    spyOn(component.templateTable, 'renderRows');
    component.deleteTemplate(template);
    expect(component.templates.length).toEqual(1);

    expect(component.templateTable.renderRows).toHaveBeenCalled();
    expect(toast.openSuccessToast).toHaveBeenCalledWith(
      `Success! ${template.name} has been deleted.`
    );
  });

  it('should not delete template from list on confiramtion', () => {
    component.templates = templateData;
    spyOn(dialog, 'open').and.returnValue(MOCK_CONFIRM_DIALOG);
    spyOn(apiService, 'deleteTemplate').and.callFake(() => {
      return throwError({status: 404});
    });
    component.deleteTemplate(template);
    expect(toast.openErrorToast).toHaveBeenCalledWith(
      `Failure! ${template.name} failed to delete.`
    );
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AppModule} from '../../app.module';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {MasterDataUploadModalComponent} from './master-data-upload-modal.component';
import {WebServices} from '../../services/web-services';
import {environment} from '../../../environments/environment';
import {ModalService, ToastService} from '@elm/elm-styleguide-ui';
import {UserInfoModel} from '../../models/user-info/user-info-model';
import {MasterDataRow} from '../../models/master-data-row/master-data-row';
import {ElmUamPermission} from '../../utils/elm-uam-permission';

describe('MasterDataUploadModalComponent', () => {
  let component: MasterDataUploadModalComponent;
  let fixture: ComponentFixture<MasterDataUploadModalComponent>;
  let injectedMatDialogRef: MatDialogRef<any>;
  let http: HttpTestingController;
  let toast: ToastService;
  let modal: ModalService;
  let data: any;

  const dialogMock = {
    close: () => {
    }
  };

  const user = new UserInfoModel();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule, HttpClientTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [WebServices, ToastService, ModalService,
        {provide: MAT_DIALOG_DATA, useValue: {}},
        {provide: MatDialogRef, useValue: dialogMock}
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    injectedMatDialogRef = TestBed.inject(MatDialogRef);
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MasterDataUploadModalComponent);
    toast = TestBed.inject(ToastService);
    modal = TestBed.inject(ModalService);
    data = TestBed.inject(MAT_DIALOG_DATA);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  beforeEach(() => {
    const blob = new Blob(['test'], {type: 'text/csv'}) as any;
    blob.lastModifiedDate = new Date();
    blob.name = 'businessUnit.csv';
    component.masterDataType = 'businessUnit';
    component.fileToUpload = blob as File;
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', () => {
    console.log('testing MasterDataUploadModalComponent');
    expect(component).toBeTruthy();
    http.expectOne(`${environment.baseServiceUrl}/v1/user/info`).flush(user);
  });

  describe('resetForm', () => {
    it('should reset the form', () => {
      spyOn(component, 'resetForm').and.callThrough();
      component.form.get('masterDataTypeDropdown')?.setValue('1');
      component.form.get('fileSelector')?.setValue('');
      component.resetForm();
      expect(component.resetForm).toHaveBeenCalled();
      expect(component.form.get('masterDataTypeDropdown')?.value).toBeNull();
      expect(component.form.get('fileSelector')?.value).toBeNull();
      http.expectOne(`${environment.baseServiceUrl}/v1/user/info`).flush(user);
    });
  });

  describe('onSubmit', () => {
    it('should call upload endpoint', () => {
      spyOn(component, 'postMasterDataFile').and.callThrough();
      component.onSubmit();
      fixture.detectChanges();
      http.expectOne(`${environment.baseServiceUrl}/v1/user/info`).flush(user);
      http.expectOne(`${environment.baseServiceUrl}/v1/businessUnit/upload`).flush({});
    });
  });

  describe('postMasterDataFile', () => {
    it('should call success toast', () => {
      spyOn(toast, 'openSuccessToast');
      if (component.fileToUpload) {
        component.postMasterDataFile(component.fileToUpload, component.masterDataType);
        fixture.detectChanges();
        http.expectOne(`${environment.baseServiceUrl}/v1/user/info`).flush(user);
        http.expectOne(`${environment.baseServiceUrl}/v1/businessUnit/upload`).flush({
          masterDataType: 'carrier',
          generalErrorMessage: '',
          base64ErrorFile: 'test'
        });
        expect(toast.openSuccessToast).toHaveBeenCalled();
      }
    });
    it('should open error modal', () => {
      spyOn(modal, 'openCustomModal');
      // @ts-ignore
      component.postMasterDataFile(component.fileToUpload, component.masterDataType);
      fixture.detectChanges();
      http.expectOne(`${environment.baseServiceUrl}/v1/user/info`).flush(user);
      http.expectOne(`${environment.baseServiceUrl}/v1/businessUnit/upload`).flush({
        masterDataType: 'carrier',
        generalErrorMessage: 'testError',
        base64ErrorFile: 'test'
      });
      expect(modal.openCustomModal).toHaveBeenCalled();
    });
  });

  describe('checking for proper file type', () => {
    it('should be valid if csv', () => {
      const mockEvt = {target: {files: [component.fileToUpload]}};
      component.handleFileInput(mockEvt as any);
      http.expectOne(`${environment.baseServiceUrl}/v1/user/info`).flush(user);
      expect(component.isValidFileType).toBeTrue();
    });
    it('should be valid if windows csv', () => {
      const blob = new Blob(['test'], {type: 'application/vnd.ms-excel'}) as any;
      blob.lastModifiedDate = new Date();
      blob.name = 'carrier.html';
      const mockEvt = {target: {files: [blob as File]}};
      component.handleFileInput(mockEvt as any);
      http.expectOne(`${environment.baseServiceUrl}/v1/user/info`).flush(user);
      expect(component.isValidFileType).toBeTrue();
    });
    it('should be invalid if not csv', () => {
      const blob = new Blob(['test'], {type: 'text/html'}) as any;
      blob.lastModifiedDate = new Date();
      blob.name = 'carrier.html';
      const mockEvt = {target: {files: [blob as File]}};
      component.handleFileInput(mockEvt as any);
      expect(component.isValidFileType).toBeFalse();
      http.expectOne(`${environment.baseServiceUrl}/v1/user/info`).flush(user);
    });
  });

  describe('enable/disable submit', () => {
    it('should disable upload when no value selected', () => {
      expect(component.uploadButtonDisabled()).toBeTrue();
      http.expectOne(`${environment.baseServiceUrl}/v1/user/info`).flush(user);
    });
    it('should enable upload when value and .csv file selected', () => {
      component.isValidFileType = true;
      expect(component.uploadButtonDisabled()).toBeFalse();
      http.expectOne(`${environment.baseServiceUrl}/v1/user/info`).flush(user);
    });
  });

  describe('handleDataTypeInput', () => {
    it('should assign the masterDataType', () => {
      const testValue = 'Testing Value';
      component.form.controls.masterDataTypeDropdown.setValue(testValue);
      expect(component.masterDataType).not.toEqual(testValue);
      component.handleDataTypeInput();
      expect(component.masterDataType).toEqual(testValue);
      http.expectOne(`${environment.baseServiceUrl}/v1/user/info`).flush(user);
    });
  });

  it('should remove message config from rows if missing permission', () => {
    data.masterDataRows = [
      new MasterDataRow({label: 'Message Config'}),
      new MasterDataRow({label: 'Other'})
    ];
    const rows = component.masterDataRows;
    expect(rows.length).toBe(1);
    http.expectOne(`${environment.baseServiceUrl}/v1/user/info`).flush(user);
  });

  it('should keep message config in rows if has permission', () => {
    data.masterDataRows = [
      new MasterDataRow({label: 'Message Config'}),
      new MasterDataRow({label: 'Other'})
    ];
    const userWithPermission = new UserInfoModel({
      permissions: [ElmUamPermission.ALLOW_MESSAGE_CONFIG_UPLOAD]
    });
    http.expectOne(`${environment.baseServiceUrl}/v1/user/info`).flush(userWithPermission);
    const rows = component.masterDataRows;
    expect(rows.length).toBe(2);
  });
});


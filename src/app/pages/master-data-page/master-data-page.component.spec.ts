import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {MasterDataPageComponent} from './master-data-page.component';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpTestingController} from '@angular/common/http/testing';
import {MasterDataRow} from '../../models/master-data-row/master-data-row';
import {environment} from '../../../environments/environment';
import {ButtonClickedEvent, ModalService} from '@elm/elm-styleguide-ui';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import { EnvironmentService } from 'src/app/services/environment-service/environment-service';
import { of } from 'rxjs';
import { WebServices } from 'src/app/services/web-services';
import * as saveAsFunctions from 'file-saver';
import {UserService} from '../../services/user-service';
import {By} from '@angular/platform-browser';
import {FormBuilder} from '@angular/forms';

describe('MasterDataPageComponent', () => {
  let component: MasterDataPageComponent;
  let fixture: ComponentFixture<MasterDataPageComponent>;
  let http: HttpTestingController;
  let modalService: ModalService;
  let masterDataRow: MasterDataRow;
  let enviromentService: EnvironmentService;
  let webServices: WebServices;
  let userService: UserService;

  const userInfo = {
    firstName: 'test',
    lastName: 'user',
    email: 'test@test.com',
    uid: '12345',
    role: 'FAL_INTERNAL_TECH_ADIMN',
    permissions: [
      'falRestrictInvoiceWrite'
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FalconTestingModule],
      declarations: [MasterDataPageComponent],
      providers: [EnvironmentService, FormBuilder]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterDataPageComponent);
    http = TestBed.inject(HttpTestingController);
    modalService = TestBed.inject(ModalService);
    enviromentService = TestBed.inject(EnvironmentService);
    webServices = TestBed.inject(WebServices);
    userService = TestBed.inject(UserService);
    component = fixture.componentInstance;
    fixture.detectChanges();
    masterDataRow = new MasterDataRow({
      label: 'Business Units',
      lastUpdated: '1970-01-01T10:00:00.000+0000',
      endpoint: 'businessUnits',
      hasDownloadableTemplate: true
    });
    http.expectOne(`${environment.baseServiceUrl}/v1/user/info`).flush(userInfo);
    http.expectOne(`${environment.baseServiceUrl}/v1/masterDataRows`).flush([masterDataRow]);
  });

  describe('downloadButtonClicked', () => {
    it('should call csvDownloadAPICall', () => {
      const buttonClickedEvent: ButtonClickedEvent = {rowIndex: 0, rowData: {endpoint: 'businessUnits'}, header: 'download'};
      const csvDownloadEndpointSpy = spyOn(component, 'csvDownloadAPICall');
      component.downloadButtonClicked(buttonClickedEvent);
      expect(csvDownloadEndpointSpy).toHaveBeenCalledWith('businessUnits');
    });

    it('should call downloadTemplate when header value is download template', () => {
      const buttonClickedEvent: ButtonClickedEvent = {
        rowIndex: 0,
        rowData: {endpoint: 'businessUnits'},
        header: 'downloadTemplate'
      };
      const templateDownloadAPICall = spyOn(component, 'templateDownloadAPICall').and.returnValue(of('test url'));
      const downloadTemplateSpy = spyOn(component, 'downloadTemplate');
      component.downloadButtonClicked(buttonClickedEvent);
      expect(templateDownloadAPICall).toHaveBeenCalled();
      expect(downloadTemplateSpy).toHaveBeenCalled();
    });
  });

  describe('csvDownloadAPICall', () => {
    it('should call proper endpoint and downloadFile', () => {
      spyOn(webServices, 'httpGet').and.returnValue(of('test'));
      const downloadCSVFileSpy = spyOn(component, 'saveCSVFile');
      component.csvDownloadAPICall('test');
      fixture.whenStable().then(() => {
        expect(downloadCSVFileSpy).toHaveBeenCalledWith('test', 'test.csv');
      });
    });
  });

  describe('saveCSVFile', () => {
    it('should call saveAs', () => {
      const saveAsSpy = spyOn(saveAsFunctions, 'saveAs').and.callFake(saveAs);
      component.saveCSVFile('test data', 'test filename');
      fixture.detectChanges();
      expect(saveAsSpy).toHaveBeenCalled();
    });
  });

  describe('templateDownloadAPICall', () => {
    it('should call templateDownloadAPICall', () => {
      const templateDownloadAPICall = spyOn(component, 'templateDownloadAPICall').and.callThrough();
      component.templateDownloadAPICall('businessUnit');
      expect(templateDownloadAPICall).toHaveBeenCalled();
    });
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', fakeAsync(() => {
    expect(component.masterDataRows.length).toEqual(1);
  }));

  describe('openFileUpload', () => {
    it('should open modal', () => {
      const openModalSpy = spyOn(modalService, 'openCustomModal').and.returnValue(of(true));
      component.openFileUploadModal();
      expect(openModalSpy).toHaveBeenCalled();
      http.expectOne(`${environment.baseServiceUrl}/v1/masterDataRows`).flush([masterDataRow]);
    });
  });

  it('should display the upload button', () => {
    component.hasMasterDataUpload = true;
    fixture.detectChanges();
    const deleteBtn = fixture.debugElement.query(By.css('#master-data-upload-button'));
    expect(deleteBtn).not.toBeNull();
  });

  it('should not display the upload button', () => {
    component.hasMasterDataUpload = false;
    fixture.detectChanges();
    const deleteBtn = fixture.debugElement.query(By.css('#master-data-upload-button'));
    expect(deleteBtn).toBeNull();
  });
});

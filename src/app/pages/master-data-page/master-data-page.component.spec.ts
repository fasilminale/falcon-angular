import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {MasterDataPageComponent} from './master-data-page.component';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpTestingController} from '@angular/common/http/testing';
import {MasterDataRow} from '../../models/master-data-row/master-data-row';
import {environment} from '../../../environments/environment';
import {ModalService} from '@elm/elm-styleguide-ui';
import {FalconTestingModule} from '../../testing/falcon-testing.module';

describe('MasterDataPageComponent', () => {
  let component: MasterDataPageComponent;
  let fixture: ComponentFixture<MasterDataPageComponent>;
  let http: HttpTestingController;
  let modalService: ModalService;
  let masterDataRow: MasterDataRow;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FalconTestingModule],
      declarations: [MasterDataPageComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterDataPageComponent);
    http = TestBed.inject(HttpTestingController);
    modalService = TestBed.inject(ModalService);
    component = fixture.componentInstance;
    fixture.detectChanges();
    masterDataRow = new MasterDataRow({
      label: 'Business Units',
      lastUpdated: '1970-01-01T10:00:00.000+0000',
      endpoint: 'businessUnits',
      hasDownloadableTemplate: true
    });
    http.expectOne(`${environment.baseServiceUrl}/v1/masterDataRows`).flush([masterDataRow]);
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', fakeAsync(() => {
    expect(component.masterDataRows.length).toEqual(1);
  }));

  describe('openFileUpload', () => {
    it('should open modal', () => {
      const openModalSpy = spyOn(modalService, 'openCustomModal');
      component.openFileUploadModal();
      expect(openModalSpy).toHaveBeenCalled();
    });
  });
});

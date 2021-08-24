import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {MasterDataPageComponent} from './master-data-page.component';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {AppModule} from '../../app.module';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {MasterDataRow} from '../../models/master-data-row/master-data-row';
import {environment} from '../../../environments/environment';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {InvoiceListPageComponent} from '../invoice-list-page/invoice-list-page.component';

describe('MasterDataPageComponent', () => {
  let component: MasterDataPageComponent;
  let fixture: ComponentFixture<MasterDataPageComponent>;
  let http: HttpTestingController;
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
    component = fixture.componentInstance;
    fixture.detectChanges();
    masterDataRow = new MasterDataRow({
      label: 'Business Units',
      lastUpdated: '1970-01-01T10:00:00.000+0000',
      endpoint: 'businessUnits',
      hasDownloadableTemplate: true
    });
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', fakeAsync(() => {
    http.expectOne(`${environment.baseServiceUrl}/v1/masterDataRows`).flush([masterDataRow]);
    tick();
    expect(component.masterDataRows.length).toEqual(1);
  }));

});

import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { FalHistoryLogModalComponent } from './fal-history-log-modal.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SubjectValue} from '@elm/elm-styleguide-ui';
import {UtilService} from '../../services/util-service';

describe('FalHistoryLogModalComponent', () => {

  const TEST_HISTORY_LOG = {
    historyLogs: [{
      field: 'testField',
      action: 'UPDATED',
      oldValue: 'oldValue',
      newValue: 'newValue',
      updatedBy: 'user',
      updatedDate: new Date().toISOString(),
      updatedTimes: 2,
      fullHistory: false,
      current: true
    },{
      field: 'testField',
      action: 'UPDATED',
      oldValue: 'oldValue',
      newValue: 'newValue',
      updatedBy: 'user',
      updatedDate: new Date().toISOString(),
      updatedTimes: 1,
      fullHistory: false,
      current: false
    }]
  };

  let component: FalHistoryLogModalComponent;
  let utilService: UtilService;
  let fixture: ComponentFixture<FalHistoryLogModalComponent>;
  let afterClosed$: SubjectValue<any>;
  let MOCK_DIALOG: any;

  beforeEach(async () => {
    afterClosed$ = new SubjectValue<any>(false);
    MOCK_DIALOG = {
      close: () => {
      },
      afterClosed: () => afterClosed$.asObservable(),
    };

    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [ FalHistoryLogModalComponent ],
      providers: [
        {provide: MatDialogRef, useValue: MOCK_DIALOG},
        {provide: MAT_DIALOG_DATA, useValue: TEST_HISTORY_LOG}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    utilService = TestBed.inject(UtilService);
    fixture = TestBed.createComponent(FalHistoryLogModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display full history', () => {
    const historyLog = {
      field: 'testField'
    };
    component.filteredHistoryLogs[0].fullHistory = false;
    component.toggleFullHistory([historyLog]);
    expect(component.filteredHistoryLogs.length).toEqual(2);
  });

  it('should hide full history', () => {
    const historyLog = {
      field: 'testField'
    };
    component.filteredHistoryLogs[0].fullHistory = true;
    component.toggleFullHistory([historyLog]);
    expect(component.filteredHistoryLogs.length).toEqual(1);
  });

  it('should not toggle full history', () => {
    const historyLog = {
      current: false
    };
    component.toggleFullHistory([historyLog]);
    expect(component.filteredHistoryLogs.length).toEqual(1);
  });

  it('should download a list of history logs', () => {
    spyOn(utilService, 'downloadCsv').and.stub();
    component.downloadCsv();
    expect(utilService.downloadCsv).toHaveBeenCalled();
  });
});

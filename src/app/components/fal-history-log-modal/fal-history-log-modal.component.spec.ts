import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FalHistoryLogModalComponent} from './fal-history-log-modal.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {MAT_DIALOG_DATA, MatDialogRef} from 'node_modules/@elm/elm-styleguide-ui/node_modules/@angular/material/dialog';
import {UtilService} from '../../services/util-service';
import {HistoryLog} from '../../models/invoice/history-log';
import { SubjectValue } from 'src/app/utils/subject-value';

describe('FalHistoryLogModalComponent', () => {

  describe('regular history log', () => {
    const TEST_DATA = {
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
      }, {
        field: 'testField',
        action: 'UPDATED',
        oldValue: 'oldValue',
        newValue: 'newValue',
        updatedBy: 'user',
        updatedDate: new Date().toISOString(),
        updatedTimes: 1,
        fullHistory: false,
        current: false
      }, {
        field: 'testField2',
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
        declarations: [FalHistoryLogModalComponent],
        providers: [
          {provide: MatDialogRef, useValue: MOCK_DIALOG},
          {provide: MAT_DIALOG_DATA, useValue: TEST_DATA}
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

    it('filtered list should be an anchor tag', () => {
      // @ts-ignore
      expect(component.filteredHistoryLogs[0].updatedTimes).toEqual('<a class="updatedTimeClickable">2</a>');
    });

    it('should display collapsed history by default', () => {
      expect(component.filteredHistoryLogs.length).toEqual(2);
    });

    it('should display expanded testField history when clicked', () => {
      // simulate selecting the first row
      const historyLog = TEST_DATA.historyLogs[0] as HistoryLog;
      component.onDataTableRowSelect([historyLog]);
      expect(component.filteredHistoryLogs.length).toEqual(3);
    });

    it('should display collapsed testField history when clicked twice', () => {
      // simulate selecting the first row
      const historyLog = TEST_DATA.historyLogs[0] as HistoryLog;
      // trigger twice to simulate selecting then unselecting
      component.onDataTableRowSelect([historyLog]);
      component.onDataTableRowSelect([historyLog]);
      expect(component.filteredHistoryLogs.length).toEqual(2);
    });

    it('should download a list of history logs', () => {
      spyOn(utilService, 'downloadCsv').and.stub();
      component.downloadCsv();
      expect(utilService.downloadCsv).toHaveBeenCalled();
    });
  });

  describe('only 1 history log', () => {
    const TEST_HISTORY_LOG = {
      historyLogs: [{
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
        declarations: [FalHistoryLogModalComponent],
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

    it('filtered list should not be an anchor tag', () => {
      expect(component.filteredHistoryLogs[0].updatedTimes).toEqual(1);
    });
  });
});

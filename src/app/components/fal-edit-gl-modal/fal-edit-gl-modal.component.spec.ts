import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FalEditGlModalComponent } from './fal-edit-gl-modal.component';
import {MAT_DIALOG_DATA, MatDialogRef} from 'node_modules/@elm/elm-styleguide-ui/node_modules/@angular/material/dialog';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {of} from 'rxjs';
import { SubjectValue } from 'src/app/utils/subject-value';

describe('FalEditGlModalComponent', () => {
  const TEST_GL_LINE_ITEM = {
    glLineItem: new FormGroup ({
      allocationPercent: new FormControl('50'),
      customerCategory: new FormControl('BAX'),
      glCostCenter: new FormControl('000'),
      glProfitCenter: new FormControl('N/A'),
      glAccount: new FormControl('000'),
      glCompanyCode: new FormControl('000'),
      glAmount: new FormControl('0'),
    })
  };

  let component: FalEditGlModalComponent;
  let fixture: ComponentFixture<FalEditGlModalComponent>;
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
      declarations: [ FalEditGlModalComponent ],
      providers: [
        {provide: MatDialogRef, useValue: MOCK_DIALOG},
        {provide: MAT_DIALOG_DATA, useValue: TEST_GL_LINE_ITEM}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FalEditGlModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog with a successful response', () => {
    component.customerCategoryControl.setValue('BAX');
    component.glLineItems = [
      {
        customerCategory: 'BAX'
      }
    ] as any;
    spyOn(component.invoiceService, 'validateGlLineItem').and.returnValue(of(null));
    spyOn(MOCK_DIALOG, 'close');
    component.confirm();
    fixture.detectChanges();
    expect(MOCK_DIALOG.close).toHaveBeenCalledTimes(1);
  });

  it('should not close dialog with an error response', () => {
    component.customerCategoryControl.setValue('BAX');
    component.glLineItems = [
      {
        customerCategory: 'BAX'
      }
    ] as any;
    spyOn(component.invoiceService, 'validateGlLineItem').and.returnValue(of({}));
    spyOn(MOCK_DIALOG, 'close');
    component.confirm();
    fixture.detectChanges();
    expect(MOCK_DIALOG.close).toHaveBeenCalledTimes(0);
  });
});

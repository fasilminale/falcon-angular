import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FalNewChargeModalComponent} from './fal-new-charge-modal.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

describe('FalCommentModalComponent', () => {
  const MOCK_DIALOG = {
    close: () => {
    }
  };

  let component: FalNewChargeModalComponent;
  let fixture: ComponentFixture<FalNewChargeModalComponent>;
  let dialogRef: MatDialogRef<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [FalNewChargeModalComponent],
      providers: [
        {
          provide: MatDialogRef, useValue: MOCK_DIALOG,
        },
        {
          provide: MAT_DIALOG_DATA, useValue: {}
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FalNewChargeModalComponent);
    dialogRef = TestBed.inject(MatDialogRef);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should confirm', () => {
    spyOn(dialogRef, 'close');
    component.confirm();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});

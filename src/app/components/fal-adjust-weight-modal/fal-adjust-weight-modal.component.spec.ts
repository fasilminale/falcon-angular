import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FalAdjustWeightModalComponent } from './fal-adjust-weight-modal.component';
import {FalCommentModalComponent} from '../fal-comment-modal/fal-comment-modal.component';
import {MAT_DIALOG_DATA, MatDialogRef} from 'node_modules/@elm/elm-styleguide-ui/node_modules/@angular/material/dialog';
import {FalconTestingModule} from '../../testing/falcon-testing.module';

describe('FalAdjustWeightModalComponent', () => {
  const MOCK_DIALOG = {
    close: () => {
    }
  };

  let component: FalAdjustWeightModalComponent;
  let fixture: ComponentFixture<FalAdjustWeightModalComponent>;
  let dialogRef: MatDialogRef<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [ FalCommentModalComponent ],
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
    fixture = TestBed.createComponent(FalAdjustWeightModalComponent);
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

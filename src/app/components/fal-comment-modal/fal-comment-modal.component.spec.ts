import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FalCommentModalComponent } from './fal-comment-modal.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {MAT_DIALOG_DATA, MatDialogRef} from 'node_modules/@elm/elm-styleguide-ui/node_modules/@angular/material/dialog';

describe('FalCommentModalComponent', () => {
  const MOCK_DIALOG = {
    close: () => {
    }
  };

  let component: FalCommentModalComponent;
  let fixture: ComponentFixture<FalCommentModalComponent>;
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
    fixture = TestBed.createComponent(FalCommentModalComponent);
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

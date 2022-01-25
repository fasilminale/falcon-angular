import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FalDeleteModalComponent } from './fal-delete-modal.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {MatDialogRef} from '@angular/material/dialog';
import {of} from 'rxjs';

describe('FalDeleteModalComponent', () => {
  const MOCK_DIALOG = {
    close: () => {
    }
  };

  let component: FalDeleteModalComponent;
  let fixture: ComponentFixture<FalDeleteModalComponent>;
  let dialogRef: MatDialogRef<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [ FalDeleteModalComponent ],
      providers: [
        {
          provide: MatDialogRef, useValue: MOCK_DIALOG
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FalDeleteModalComponent);
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

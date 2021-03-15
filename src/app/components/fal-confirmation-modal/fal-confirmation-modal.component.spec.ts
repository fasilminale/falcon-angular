import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FalConfirmationModalComponent} from './fal-confirmation-modal.component';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';


describe('FalConfirmationModalComponent', () => {
  let component: FalConfirmationModalComponent;
  let fixture: ComponentFixture<FalConfirmationModalComponent>;

  let injectedMatDialogRef: MatDialogRef<any>;

  const dialogMock = {
    close: (_: boolean) => {
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule],
      declarations: [FalConfirmationModalComponent],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {}},
        {provide: MatDialogRef, useValue: dialogMock}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    injectedMatDialogRef = TestBed.inject(MatDialogRef);
    fixture = TestBed.createComponent(FalConfirmationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have false result when deny option is called', () => {
    spyOn(dialogMock, 'close').and.callThrough();
    component.deny();
    expect(dialogMock.close).toHaveBeenCalledWith(false);
  });

  it('should have true result when confirm option is called', () => {
    spyOn(dialogMock, 'close').and.callThrough();
    component.confirm();
    expect(dialogMock.close).toHaveBeenCalledWith(true);
  });

});

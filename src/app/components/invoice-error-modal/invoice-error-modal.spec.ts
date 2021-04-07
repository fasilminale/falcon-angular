import {ComponentFixture, TestBed} from '@angular/core/testing';
import {InvoiceErrorModalComponent} from './invoice-error-modal';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';


describe('FalConfirmationModalComponent', () => {
  let component: InvoiceErrorModalComponent;
  let fixture: ComponentFixture<InvoiceErrorModalComponent>;

  let injectedMatDialogRef: MatDialogRef<any>;

  const dialogMock = {
    close: (_: boolean) => {
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule],
      declarations: [InvoiceErrorModalComponent],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {}},
        {provide: MatDialogRef, useValue: dialogMock}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    injectedMatDialogRef = TestBed.inject(MatDialogRef);
    fixture = TestBed.createComponent(InvoiceErrorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have false result when deny option is called', () => {
    spyOn(dialogMock, 'close').and.callThrough();
    component.close();
    expect(dialogMock.close).toHaveBeenCalledWith(false);
  });

});

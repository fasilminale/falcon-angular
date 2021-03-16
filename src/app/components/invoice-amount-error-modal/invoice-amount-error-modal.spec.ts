import {ComponentFixture, TestBed} from '@angular/core/testing';
import {InvoiceAmountErrorModalComponent} from './invoice-amount-error-modal';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';


describe('FalConfirmationModalComponent', () => {
  let component: InvoiceAmountErrorModalComponent;
  let fixture: ComponentFixture<InvoiceAmountErrorModalComponent>;

  let injectedMatDialogRef: MatDialogRef<any>;

  const dialogMock = {
    close: (_: boolean) => {
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule],
      declarations: [InvoiceAmountErrorModalComponent],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {}},
        {provide: MatDialogRef, useValue: dialogMock}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    injectedMatDialogRef = TestBed.inject(MatDialogRef);
    fixture = TestBed.createComponent(InvoiceAmountErrorModalComponent);
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

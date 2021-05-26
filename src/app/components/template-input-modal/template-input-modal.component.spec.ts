import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TemplateInputModalComponent, TemplateInputModalComponentData} from './template-input-modal.component';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {TemplateService} from '../../services/template-service';
import {of} from 'rxjs';

describe('InputModalComponent', () => {
  let component: TemplateInputModalComponent;
  let fixture: ComponentFixture<TemplateInputModalComponent>;
  let dialogRef: MatDialogRef<any>;
  let template: TemplateService;

  const dialogMock = {
    close: () => {
    }
  };

  const diaogData: TemplateInputModalComponentData = {
    isPaymentOverrideSelected: false
  }
  const apiMock = {
    checkTemplateIsDuplicate: () => {
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TemplateInputModalComponent],
      providers: [
        {provide: MatDialogRef, useValue: dialogMock},
        {provide: MAT_DIALOG_DATA, useValue: diaogData},
        {provide: TemplateService, useValue: apiMock}
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    dialogRef = TestBed.inject(MatDialogRef);
    template = TestBed.inject(TemplateService);
    fixture = TestBed.createComponent(TemplateInputModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('dialog should be closed after confirm()', async () => {
    spyOn(dialogRef, 'close').and.callThrough();
    spyOn(template, 'checkTemplateIsDuplicate').and.returnValue(of(false));
    await component.confirm();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('dialog should NOT be closed after confirm() with duplicate template name', async () => {
    spyOn(template, 'checkTemplateIsDuplicate').and.returnValue(of(true));
    spyOn(dialogRef, 'close').and.callThrough();
    await component.confirm();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('should confirm', () => {
    spyOn(component, 'confirm');
    spyOn(template, 'checkTemplateIsDuplicate').and.returnValue(of(false));
    const event = new KeyboardEvent('window:keyup', {code: 'Enter'});
    component.confirmOnEnterKeyEvent(event);
    expect(component.confirm).toHaveBeenCalled();
  });

  it('should NOT confirm with duplicate template name and Enter clicked/', async () => {
    spyOn(component, 'confirm');
    spyOn(template, 'checkTemplateIsDuplicate').and.returnValue(of(true));
    spyOn(dialogRef, 'close');
    const event = new KeyboardEvent('window:keyup', {code: 'Enter'});
    await component.confirmOnEnterKeyEvent(event);
    expect(component.confirm).toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('should not confirm', () => {
    spyOn(component, 'confirm');
    spyOn(template, 'checkTemplateIsDuplicate').and.returnValue(of(false));
    const event = new KeyboardEvent('window:keyup', {code: 'Esc'});
    component.confirmOnEnterKeyEvent(event);
    expect(component.confirm).not.toHaveBeenCalled();
  });
});

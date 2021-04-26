import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { TemplateInputModalComponent } from './template-input-modal.component';
import {MatDialogRef} from '@angular/material/dialog';
import {By} from '@angular/platform-browser';

describe('InputModalComponent', () => {
  let component: TemplateInputModalComponent;
  let fixture: ComponentFixture<TemplateInputModalComponent>;
  let dialogRef: MatDialogRef<any>;

  const dialogMock = {
    close: () => { }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateInputModalComponent ],
      providers: [
        { provide: MatDialogRef, useValue: dialogMock }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    dialogRef = TestBed.inject(MatDialogRef);
    fixture = TestBed.createComponent(TemplateInputModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('dialog should be closed after confirm()', fakeAsync(() => {
    spyOn(dialogRef, 'close').and.callThrough();
    component.confirm();
    tick(150);
    expect(dialogRef.close).toHaveBeenCalled();
  }));

  it('should confirm', () => {
    spyOn(component, 'confirm');
    const event = new KeyboardEvent('window:keyup', {code: 'Enter'});
    component.confirmOnEnterKeyEvent(event);
    expect(component.confirm).toHaveBeenCalled();
  });

  it('should not confirm', () => {
    spyOn(component, 'confirm');
    const event = new KeyboardEvent('window:keyup', {code: 'Esc'});
    component.confirmOnEnterKeyEvent(event);
    expect(component.confirm).not.toHaveBeenCalled();
  });
});

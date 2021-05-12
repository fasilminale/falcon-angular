import {ComponentFixture, TestBed} from '@angular/core/testing';

import {UploadFormComponent} from './upload-form.component';
import {of} from 'rxjs';
import {UtilService} from '../../services/util-service';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {SimpleChanges} from '@angular/core';
import {FalFileInputComponent} from '../fal-file-input/fal-file-input.component';

describe('UploadFormComponent', () => {
  let component: UploadFormComponent;
  let fixture: ComponentFixture<UploadFormComponent>;
  let util: UtilService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
        NoopAnimationsModule,
        MatDialogModule
      ],
      declarations: [UploadFormComponent],
      providers: [
        UtilService,
        MatSnackBar,
        MatDialog,
      ]
    })
      .compileComponents();
    util = TestBed.inject(UtilService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sync controls on isDisabled change', () => {
    component.isDisabled = true;
    component.ngOnChanges({isDisabled: {currentValue: true}} as unknown as SimpleChanges);
    expect(component.formGroup.disabled).toBeTrue();
    expect(component.formGroup.enabled).toBeFalse();
  });

  it('should not sync controls when isDisabled is not changed', () => {
    spyOn(component, 'syncControlState').and.callThrough();
    const wasDisabled = component.formGroup.disabled;
    const wasEnabled = component.formGroup.enabled;
    component.ngOnChanges({} as unknown as SimpleChanges);
    expect(component.syncControlState).not.toHaveBeenCalled();
    expect(component.formGroup.disabled).toEqual(wasDisabled);
    expect(component.formGroup.enabled).toEqual(wasEnabled);
  });

  it('should not sync controls when provided null change', () => {
    spyOn(component, 'syncControlState').and.callThrough();
    const wasDisabled = component.formGroup.disabled;
    const wasEnabled = component.formGroup.enabled;
    component.ngOnChanges(null as unknown as SimpleChanges);
    expect(component.syncControlState).not.toHaveBeenCalled();
    expect(component.formGroup.disabled).toEqual(wasDisabled);
    expect(component.formGroup.enabled).toEqual(wasEnabled);
  });

  it('should add attachment', () => {
    const testFile = new File([], 'test file');
    const testType = 'test type';
    component.file.setValue(testFile);
    component.attachmentType.setValue(testType);
    component.addAttachment();
    expect(component.attachments).toEqual([{file: testFile, type: testType, uploadError: false, action: 'UPLOAD'}]);
  });

  it('should reset', () => {
    component.reset();
    expect(component.attachments).toHaveSize(0);
    expect(component.attachmentType.value).toBeNull();
    expect(component.file.value).toBeNull();
  });

  it('should load attachment data', () => {
    component.load([
      {
        deleted: false,
        fileName: 'test file',
        type: 'test type'
      },
      {
        deleted: true,
        fileName: 'deleted file',
        type: 'deleted type'
      },
      {
        deleted: false,
        type: 'missing filename type'
      }]);
    expect(component.attachments).toHaveSize(2);
    expect(component.attachments[0].file.name).toEqual('test file');
    expect(component.attachments[0].type).toEqual('test type');
    expect(component.attachments[0].uploadError).toEqual(false);
    expect(component.attachments[0].action).toEqual('NONE');
    expect(component.attachments[1].file.name).toEqual('');
    expect(component.attachments[1].type).toEqual('missing filename type');
    expect(component.attachments[1].uploadError).toEqual(false);
    expect(component.attachments[1].action).toEqual('NONE');
  });

  it('should reset form controls on attachment add', () => {
    component.fileChooserInput = {
      reset: () => {
      }
    } as unknown as FalFileInputComponent;
    spyOn(component.fileChooserInput, 'reset');
    const testFile = new File([], 'test file');
    const testType = 'test type';
    component.file.setValue(testFile);
    component.attachmentType.setValue(testType);
    component.addAttachment();
    expect(component.fileChooserInput.reset).toHaveBeenCalled();
    expect(component.file.value).toBeFalsy();
    expect(component.attachmentType.value).toBeFalsy();
  });


  it('should remove attachment', async () => {
    const testFile = new File([], 'test file');
    const testType = 'test type';
    spyOn(util, 'openConfirmationModal').and.returnValue(of('confirm'));
    component.file.setValue(testFile);
    component.attachmentType.setValue(testType);
    component.addAttachment();
    await component.removeAttachment(0);
    expect(component.attachments).toEqual([]);
  });

  it('should not remove attachment', async () => {
    const testFile = new File([], 'test file');
    const testType = 'test type';
    spyOn(util, 'openConfirmationModal').and.returnValue(of('cancel'));
    component.file.setValue(testFile);
    component.attachmentType.setValue(testType);
    component.addAttachment();
    await component.removeAttachment(0);
    expect(component.attachments).toHaveSize(1);
  });

  it('should validate an external attachment exists', () => {
    const testFile = new File([], 'test file');
    const testType = 'EXTERNAL';
    component.file.setValue(testFile);
    component.attachmentType.setValue(testType);
    component.addAttachment();
    expect(component.externalAttachment).toBeTrue();
  });

  it('should fail external attachment validation', async () => {
    const testFile = new File([], 'test file');
    const testType = 'EXTERNAL';
    spyOn(util, 'openConfirmationModal').and.returnValue(of('confirm'));
    component.file.setValue(testFile);
    component.attachmentType.setValue(testType);
    component.addAttachment();
    await component.removeAttachment(0);
    expect(component.externalAttachment).toBeFalse();
  });

  it('should not modify attachment', async () => {
    const attachment: any = {
      file: new File([], 'test file'),
      type: 'test type',
      uploadError: false,
      action: 'NONE'
    };
    component.attachments.push(attachment);
    spyOn(util, 'openConfirmationModal').and.returnValue(of('confirm'));
    await component.removeAttachment(0);
    expect(component.attachments).toHaveSize(1);
  });

});

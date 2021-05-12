import {ComponentFixture, TestBed} from '@angular/core/testing';

import {UploadFormComponent} from './upload-form.component';
import {of} from 'rxjs';
import {UtilService} from '../../services/util-service';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

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

  it('should add attachment', () => {
    const testFile = new File([], 'test file');
    const testType = 'test type';
    component.formGroup.controls.file.setValue(testFile);
    component.formGroup.controls.attachmentType.setValue(testType);
    component.addAttachment();
    expect(component.attachments).toEqual([{file: testFile, type: testType, uploadError: false, action: 'UPLOAD'}]);
  });

  it('should reset form controls on attachment add', () => {
    const testFile = new File([], 'test file');
    const testType = 'test type';
    component.formGroup.controls.file.setValue(testFile);
    component.formGroup.controls.attachmentType.setValue(testType);
    component.addAttachment();
    expect(component.formGroup.controls.file.value).toBeFalsy();
    expect(component.formGroup.controls.attachmentType.value).toBeFalsy();
  });


  it('should remove attachment', async () => {
    const testFile = new File([], 'test file');
    const testType = 'test type';
    spyOn(util, 'openConfirmationModal').and.returnValue(of('confirm'));
    component.formGroup.controls.file.setValue(testFile);
    component.formGroup.controls.attachmentType.setValue(testType);
    component.addAttachment();
    await component.removeAttachment(0);
    expect(component.attachments).toEqual([]);
  });

  it('should not remove attachment', async () => {
    const testFile = new File([], 'test file');
    const testType = 'test type';
    spyOn(util, 'openConfirmationModal').and.returnValue(of('cancel'));
    component.formGroup.controls.file.setValue(testFile);
    component.formGroup.controls.attachmentType.setValue(testType);
    component.addAttachment();
    await component.removeAttachment(0);
    expect(component.attachments).toHaveSize(1);
  });

  it('should validate an external attachment exists', () => {
    const testFile = new File([], 'test file');
    const testType = 'EXTERNAL';
    component.formGroup.controls.file.setValue(testFile);
    component.formGroup.controls.attachmentType.setValue(testType);
    component.addAttachment();
    expect(component.externalAttachment).toBeTrue();
  });

  it('should fail external attachment validation', async () => {
    const testFile = new File([], 'test file');
    const testType = 'EXTERNAL';
    spyOn(util, 'openConfirmationModal').and.returnValue(of('confirm'));
    component.formGroup.controls.file.setValue(testFile);
    component.formGroup.controls.attachmentType.setValue(testType);
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

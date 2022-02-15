import {ComponentFixture, TestBed} from '@angular/core/testing';
import {UploadFormComponent} from './upload-form.component';
import {of} from 'rxjs';
import {UtilService} from '../../services/util-service';
import {SimpleChanges} from '@angular/core';
import {FalFileInputComponent} from '../fal-file-input/fal-file-input.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';

describe('UploadFormComponent', () => {
  const TEST_FILE_1 = new File([], 'test file 1');
  const TEST_FILE_2 = new File([], 'test file 2');

  let component: UploadFormComponent;
  let fixture: ComponentFixture<UploadFormComponent>;
  let util: UtilService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [UploadFormComponent],
    }).compileComponents();
    util = TestBed.inject(UtilService);
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
    expect(component.attachments).toEqual([{
      file: testFile,
      type: testType,
      uploadError: false,
      action: 'UPLOAD',
      url: undefined
    }]);
  });

  it('should reset', () => {
    component.reset();
    expect(component.attachments).toHaveSize(0);
    expect(component.attachmentType.value).toBeNull();
    expect(component.file.value).toBeNull();
    expect(component.externalAttachment).toBeFalse();
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
    spyOn(util, 'openConfirmationModal').and.returnValue(of(false));
    component.file.setValue(testFile);
    component.attachmentType.setValue(testType);
    await component.removeAttachment(0);
    expect(component.attachments).toEqual([]);
  });

  it('should not remove attachment', async () => {
    const testFile = new File([], 'test file');
    const testType = 'test type';
    spyOn(util, 'openConfirmationModal').and.returnValue(of(false));
    component.file.setValue(testFile);
    component.attachmentType.setValue(testType);
    component.addAttachment();
    await component.removeAttachment(0);
    expect(component.attachments).toHaveSize(1);
  });

  it('should validate an external attachment exists', () => {
    const testFile = new File([], 'test file');
    const testType = 'External Invoice';
    component.file.setValue(testFile);
    component.attachmentType.setValue(testType);
    component.addAttachment();
    expect(component.externalAttachment).toBeTrue();
  });

  it('should fail external attachment validation', async () => {
    const testFile = new File([], 'test file');
    const testType = 'External Invoice';
    spyOn(util, 'openConfirmationModal').and.returnValue(of(true));
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
      action: 'NONE',
      url: 'url'
    };
    component.attachments.push(attachment);
    spyOn(util, 'openConfirmationModal').and.returnValue(of(true));
    await component.removeAttachment(0);
    expect(component.attachments).toHaveSize(1);
  });

  it('should set pristine to false on adding attachment', () => {
    const testFile = new File([], 'test file');
    const testType = 'External Invoice';
    component.file.setValue(testFile);
    component.attachmentType.setValue(testType);
    component.uploadButtonClick();
    expect(component.pristine).toBeFalse();
  });

  it('should set pristine to false on removing attachment', async () => {
    const attachment: any = {
      file: new File([], 'test file'),
      type: 'test type',
      uploadError: false,
      action: 'NONE',
      url: 'url'
    };
    component.attachments.push(attachment);
    spyOn(util, 'openConfirmationModal').and.returnValue(of(true));
    await component.removeAttachment(0);
    expect(component.pristine).toBeFalse();
  });

  it('should download attachment', () => {
    const attachment: any = {
      file: new File([], 'test file'),
      type: 'test type',
      uploadError: false,
      action: 'NONE',
      url: 'url'
    };
    component.attachments.push(attachment);
    spyOn(component, 'downloadAttachment').and.callThrough();
    component.downloadAttachment(0);
    expect(component.downloadAttachment).toHaveBeenCalled();
  });

  it('should add attachment if duplicate is NOT found', () => {
    component.file.setValue(TEST_FILE_2);
    component.attachmentType.setValue('test type 2');
    component.attachments.push({
      file: TEST_FILE_1,
      type: 'test type 1',
      uploadError: false,
      action: 'NONE',
      url: 'url'
    });
    spyOn(util, 'openConfirmationModal').and.returnValue(of(false));
    component.uploadButtonClick();
    expect(util.openConfirmationModal).not.toHaveBeenCalled();
    expect(component.attachments).toEqual([{
      file: TEST_FILE_1,
      type: 'test type 1',
      uploadError: false,
      action: 'NONE',
      url: 'url'
    }, {
      file: TEST_FILE_1,
      type: 'test type 2',
      uploadError: false,
      action: 'UPLOAD',
      url: undefined
    }]);
  });

  it('should do nothing if duplicate is found but replace is denied', async () => {
    component.file.setValue(TEST_FILE_1);
    component.attachmentType.setValue('test type 2');
    component.attachments.push({
      file: TEST_FILE_1,
      type: 'test type 1',
      uploadError: false,
      action: 'NONE',
      url: 'url'
    });
    spyOn(util, 'openConfirmationModal').and.returnValue(of(false));
    await component.uploadButtonClick();
    expect(util.openConfirmationModal).toHaveBeenCalled();
    expect(component.attachments).toEqual([{
      file: TEST_FILE_1,
      type: 'test type 1',
      uploadError: false,
      action: 'NONE',
      url: 'url'
    }]);
  });

  it('should replace attachment if duplicate is found', async () => {
    component.file.setValue(TEST_FILE_1);
    component.attachmentType.setValue('test type 2');
    component.attachments.push({
      file: TEST_FILE_1,
      type: 'test type 1',
      uploadError: false,
      action: 'NONE',
      url: 'url'
    });
    spyOn(util, 'openConfirmationModal').and.returnValue(of(true));
    await component.uploadButtonClick();
    expect(util.openConfirmationModal).toHaveBeenCalled();
    expect(component.attachments).toEqual([{
      file: TEST_FILE_1,
      type: 'test type 1',
      uploadError: false,
      action: 'DELETE',
      url: 'url'
    }, {
      file: TEST_FILE_1,
      type: 'test type 2',
      uploadError: false,
      action: 'UPLOAD',
      url: undefined
    }]);
  });

  it('should filter out deleted attachments', () => {
    component.file.setValue(TEST_FILE_1);
    component.attachmentType.setValue('test type 2');
    component.attachments.push({
      file: TEST_FILE_1,
      type: 'test type 1',
      uploadError: false,
      action: 'DELETE',
      url: 'url'
    });
    spyOnProperty(component, 'numberOfAttachments').and.callThrough();
    const result = component.numberOfAttachments;
    expect(result).toEqual(0);
    expect(component.attachments.length).toEqual(1);
  });

  it('should find attachments in list', () => {
    const attachment: any = {
      file: TEST_FILE_1,
      type: 'test type',
      uploadError: false,
      action: 'NONE',
      url: 'url'
    };
    component.attachments.push(attachment);
    const result = component.hasFileWithName(TEST_FILE_1.name);
    expect(result).toBeTrue();
  });

  it('should not find marked for delete attachments in list', () => {
    const attachment: any = {
      file: TEST_FILE_1,
      type: 'test type',
      uploadError: false,
      action: 'DELETE',
      url: 'url'
    };
    component.attachments.push(attachment);
    const result = component.hasFileWithName(TEST_FILE_1.name);
    expect(result).toBeFalse();
  });

});

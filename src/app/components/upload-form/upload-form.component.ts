import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UtilService} from '../../services/util-service';
import {FalFileInputComponent} from '../fal-file-input/fal-file-input.component';

@Component({
  selector: 'app-upload-form',
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.scss']
})
export class UploadFormComponent implements OnInit, OnChanges {

  public readonly DOCUMENT_TYPE_OPTIONS = [
    'External Invoice',
    'Supporting Documentation',
    'Operational Approval'
  ];

  @Input() isDisabled = false;
  @ViewChild(FalFileInputComponent) fileChooserInput?: FalFileInputComponent;

  /* FORM CONTROLS */
  public readonly formGroup: FormGroup;
  public readonly attachmentType: FormControl;
  public readonly file: FormControl;

  /* FIELDS */
  public externalAttachment = false;
  public attachments: Array<Attachment> = [];

  constructor(private util: UtilService) {
    this.attachmentType = new FormControl(null, [Validators.required]);
    this.file = new FormControl(null, [Validators.required]);
    this.formGroup = new FormGroup({
      attachmentType: this.attachmentType,
      file: this.file
    });
  }

  /* NG METHODS */
  ngOnInit(): void {
    this.syncControlState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.isDisabled) {
      this.syncControlState();
    }
  }

  public syncControlState(): void {
    // build list of controls
    [this.formGroup, this.attachmentType, this.file]
      // perform the same action on each
      .forEach(c => this.isDisabled ? c.disable() : c.enable());
  }

  /* OTHER METHODS */
  public load(attachmentData: Array<any>): void {
    this.reset();
    attachmentData.filter(a => !a.deleted)
      .forEach(a => this.attachments.push({
        file: new File([], a.fileName ?? ''),
        type: a.type,
        uploadError: false,
        action: 'NONE',
        url: a.url
      }));
    this.externalAttachment = this.validateExternalAttachment();
  }

  public reset(): void {
    this.attachments = [];
    this.externalAttachment = false;
    [this.formGroup, this.attachmentType, this.file]
      .forEach(c => c.reset());
  }

  public async uploadButtonClick(): Promise<void> {
    const fileName = this.file.value.name;
    const isDuplicate = this.hasFileWithName(fileName);
    if (isDuplicate) {
      const confirmReplace = await this.confirmReplaceAttachment();
      if (confirmReplace) {
        // DO REPLACE
        const index = this.attachmentNames.indexOf(fileName);
        this.forceRemoveAttachment(index);
        this.addAttachment();
      }
    } else {
      // DO ADD
      this.addAttachment();
    }
  }

  public hasFileWithName(name: string): boolean {
    return this.attachments
      .filter(a => a.action !== 'DELETE')
      .map(a => a.file.name)
      .includes(name);
  }

  private get attachmentNames(): Array<string> {
    return this.attachments.map(a => a.file.name);
  }

  private async confirmReplaceAttachment(): Promise<boolean> {
    return this.util.openConfirmationModal({
      title: `File Name Already Exists`,
      innerHtmlMessage: `You may replace exising file OR rename the file on local drive and upload again.`,
      confirmButtonText: 'Replace',
      cancelButtonText: 'Cancel'
    }).toPromise();
  }

  public addAttachment(): void {
    if (this.file.value && this.attachmentType.value) {
      this.attachments.push({
        uploadError: false,
        file: this.file.value,
        type: this.attachmentType.value,
        action: 'UPLOAD',
        url: undefined
      });
      this.formGroup.reset();
      this.externalAttachment = this.validateExternalAttachment();
      if (this.fileChooserInput) {
        this.fileChooserInput.reset();
      }
    }
  }

  public async removeAttachment(index: number): Promise<void> {
    if (await this.confirmRemoveAttachment()) {
      this.forceRemoveAttachment(index);
    }
  }

  private forceRemoveAttachment(index: number): void {
    if (this.attachments.length > index) {
      const attachment = this.attachments[index];
      if (attachment.action === 'NONE') {
        attachment.action = 'DELETE';
      } else {
        this.attachments.splice(index, 1);
      }
      this.externalAttachment = this.validateExternalAttachment();
      this.util.openSnackBar(`Success! ${attachment.file.name} was removed.`);
      this.formGroup.markAsDirty();
    }
  }

  public downloadAttachment(index: number): void {
    if (this.attachments[index].url) {
      window.open(this.attachments[index].url);
    }
  }

  public async confirmRemoveAttachment(): Promise<boolean> {
    return this.util.openConfirmationModal({
      title: 'Remove Attachment',
      innerHtmlMessage: `Are you sure you want to remove this attachment?
            <br/><br/><strong>This action cannot be undone.</strong>`,
      confirmButtonText: 'Remove Attachment',
      cancelButtonText: 'Cancel'
    }).toPromise();
  }

  private validateExternalAttachment(): boolean {
    return this.attachments.some(attachment =>
      (attachment.type === 'EXTERNAL' || attachment.type === 'External Invoice')
      && attachment.action !== 'DELETE'
    );
  }
}

export interface Attachment {
  file: File;
  type: string;
  uploadError: boolean;
  action: 'UPLOAD' | 'DELETE' | 'NONE';
  url?: string;
}

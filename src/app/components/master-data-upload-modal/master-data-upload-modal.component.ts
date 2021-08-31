import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {WebServices} from '../../services/web-services';
import {environment} from '../../../environments/environment';
import {MasterDataUploadResponseModel} from '../../models/master-data-upload-response/master-data-upload-response-model';
import {ModalService, ToastService} from '@elm/elm-styleguide-ui';

export interface MasterDataUploadModalData {
  masterDataRows: [];
}

@Component({
  selector: 'app-master-data-upload-modal',
  templateUrl: './master-data-upload-modal.component.html'
})
export class MasterDataUploadModalComponent {
  fb = new FormBuilder();
  form: FormGroup = new FormGroup({
    initial: new FormControl()
  });
  fileToUpload: File | null = null;
  masterDataType = '';
  isValidFileType = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: MasterDataUploadModalData,
              public dialogRef: MatDialogRef<MasterDataUploadModalComponent>,
              private webService: WebServices,
              private toastService: ToastService,
              private modalService: ModalService) {
    this.resetForm();
  }

  onSubmit(): void {
    if (this.fileToUpload) {
      this.postMasterDataFile(this.fileToUpload, this.masterDataType);
    }
  }

  resetForm(): void {
    this.form = this.fb.group({
      masterDataTypeDropdown: new FormControl(),
      fileSelector: new FormControl(),
    });
  }

  handleFileInput(event: Event): void {
    // @ts-ignore
    this.fileToUpload = (event.target as HTMLInputElement).files[0];
    if (this.fileToUpload.type === 'text/csv' || this.fileToUpload.type === 'application/vnd.ms-excel'){
      this.isValidFileType = true;
    }
  }

  handleDataTypeInput(): void {
    this.masterDataType = this.form.controls.masterDataTypeDropdown.value;
  }

  postMasterDataFile(fileToUpload: File, masterDataType: string): void {
    const formData: FormData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);
    this.webService.httpPost(`${environment.baseServiceUrl}/v1/${masterDataType}/upload`, formData)
      .subscribe(response => {
        const masterDataUploadResponse = new MasterDataUploadResponseModel(response);
        if (!masterDataUploadResponse.generalErrorMessage || masterDataUploadResponse.generalErrorMessage.length === 0){
          const message = '<strong>Upload Successful:</strong> Data Model Successfully Updated';
          this.toastService.openSuccessToast(message);
        } else {
          // TODO: Error Modal - FAL-503
        }
        this.dialogRef.close();
      });
  }
  uploadButtonDisabled(): boolean {
    return !(this.fileToUpload !== null && this.isValidFileType && this.masterDataType.length > 0);
  }
}


import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, DialogRole} from '@angular/material/dialog';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {WebServices} from '../../services/web-services';
import {environment} from '../../../environments/environment';
import {MasterDataUploadResponseModel} from '../../models/master-data-upload-response/master-data-upload-response-model';
import {ModalService, ToastService} from '@elm/elm-styleguide-ui';
import {MasterDataUploadErrorModalComponent} from '../master-data-upload-error-modal/master-data-upload-error-modal.component';
import {UserService} from '../../services/user-service';
import {ElmUamPermission} from '../../utils/elm-uam-permission';
import {MasterDataRow} from '../../models/master-data-row/master-data-row';

export interface MasterDataUploadModalData {
  masterDataRows: Array<MasterDataRow>;
}

@Component({
  selector: 'app-master-data-upload-modal',
  templateUrl: './master-data-upload-modal.component.html'
})
export class MasterDataUploadModalComponent {
  fb = new UntypedFormBuilder();
  form: UntypedFormGroup = new UntypedFormGroup({
    initial: new UntypedFormControl()
  });
  fileToUpload: File | null = null;
  masterDataType = '';
  isValidFileType = false;
  hasMessageConfigUploadPermission = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: MasterDataUploadModalData,
              public dialogRef: MatDialogRef<MasterDataUploadModalComponent>,
              private webService: WebServices,
              private toastService: ToastService,
              private modalService: ModalService,
              private userService: UserService) {
    this.resetForm();
    this.userService.getUserInfo().subscribe(userInfo => {
      this.hasMessageConfigUploadPermission = userInfo.hasAtLeastOnePermission([ElmUamPermission.ALLOW_MESSAGE_CONFIG_UPLOAD]);
    });
  }

  get masterDataRows(): Array<MasterDataRow> {
    const rows = this.data.masterDataRows ?? [];
    if (this.hasMessageConfigUploadPermission) {
      return rows;
    }
    // removes message config from rows, since user doesn't have permission to upload
    return rows.filter(row => row.label !== 'Message Config')
  }

  onSubmit(): void {
    if (this.fileToUpload) {
      this.postMasterDataFile(this.fileToUpload, this.masterDataType);
    }
  }

  resetForm(): void {
    this.form = this.fb.group({
      masterDataTypeDropdown: new UntypedFormControl(),
      fileSelector: new UntypedFormControl(),
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
          this.openUploadErrorModal(masterDataUploadResponse);
        }
        this.dialogRef.close();
      });
  }
  uploadButtonDisabled(): boolean {
    return !(this.fileToUpload !== null && this.isValidFileType && this.masterDataType.length > 0);
  }

  openUploadErrorModal(masterDataUploadResponse: MasterDataUploadResponseModel): void {
    const roleType: DialogRole = 'alertdialog';
    const dialogData = {
      minWidth: '525px',
      width: '33vw',
      role: roleType,
      autoFocus: false,
      data: masterDataUploadResponse
    };
    this.modalService.openCustomModal(MasterDataUploadErrorModalComponent, dialogData);
  }
}


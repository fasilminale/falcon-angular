import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from 'node_modules/@elm/elm-styleguide-ui/node_modules/@angular/material/dialog';
import {MasterDataUploadResponseModel} from '../../models/master-data-upload-response/master-data-upload-response-model';

@Component({
  selector: 'app-master-data-upload-error-modal',
  templateUrl: './master-data-upload-error-modal.component.html',
  styleUrls: ['./master-data-upload-error-modal.scss']
})
export class MasterDataUploadErrorModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: MasterDataUploadResponseModel,
              public dialogRef: MatDialogRef<MasterDataUploadErrorModalComponent>) {
  }
  public readonly SOME_DOCUMENTS_INSERTED_MESSAGE = 'Update partially failed due to file errors.';
  downloadFileFromBase64(fileName: string, data: any, fileFormat: string): void {
    const linkSource = 'data:' + fileFormat + ';base64,' + data;
    const downloadLink = document.createElement('a');
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }
}

export class MasterDataUploadResponseModel {
  masterDataType = '';
  generalErrorMessage = '';
  base64ErrorFile = '';

  constructor(json?: any) {
    if (json?.masterDataType) {
      this.masterDataType = json.masterDataType;
    }
    if (json?.generalErrorMessage) {
      this.generalErrorMessage = json.generalErrorMessage;
    }
    if (json?.base64ErrorFile) {
      this.base64ErrorFile = json.base64ErrorFile;
    }
  }
}

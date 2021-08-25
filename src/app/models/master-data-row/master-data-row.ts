export class MasterDataRow {
  label = '';
  lastUpdated = '';
  endpoint = '';
  hasDownloadableTemplate = false;

  constructor(json?: any) {
    this.label = json?.label;
    this.lastUpdated = json?.lastUpdated;
    this.endpoint = json?.endpoint;
    this.hasDownloadableTemplate = json?.hasDownloadableTemplate;
  }
}

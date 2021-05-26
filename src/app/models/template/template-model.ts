import {LineItem} from './linItem-model';

export interface TemplateToSave {
  falconInvoiceNumber: string;
  name: string;
  description: string;
}

export class Template {
  templateId = '';
  companyCode = '';
  createdBy = '';
  currency = '';
  description = '';
  erpType = '';
  falconInvoiceNumber = '';
  lineItems: LineItem[] = [];
  name = '';
  vendorNumber = '';
  workType = '';
  isDisable = true;
  isError = false;
  createdDate = '';
  tempDesc = '';
  tempName = '';

  constructor(json?: any) {
    this.templateId = json?.templateId;
    this.companyCode = json?.companyCode;
    this.createdBy = json?.createdBy;
    this.currency = json?.currency;
    this.description = json?.description;
    this.erpType = json?.erpType;
    this.falconInvoiceNumber = json?.falconInvoiceNumber;
    this.name = json?.name;
    this.workType = json?.workType;
    this.createdDate = json?.createdDate;
    if (json?.lineItems) {
      json.lineItems.forEach((lineItem: any) => {
        this.lineItems.push(new LineItem(lineItem));
      });
    }
  }

}

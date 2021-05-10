import { LineItem } from "./linItem-model";

export class Template {
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
    createdDate = '';

    constructor(json?: any) {
        this.companyCode = json?.companyCode;
        this.createdBy = json?.createdBy;
        this.currency = json?.currency;
        this.description = json?.description;
        this.erpType = json?.erpType;
        this.falconInvoiceNumber = json?.falconInvoiceNumber;
        this.name = json?.name;
        this.workType = json?.workType;
        this.createdDate = json?.createdDate;
        if(json?.lineItems) {
            json.lineItems.forEach((lineItem: any) => {
                this.lineItems.push(new LineItem(lineItem));
            });
        }
    }

}
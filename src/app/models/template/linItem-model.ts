export class LineItem {
    companyCode = '';
    costCenter = '';
    glAccount = '';
    lineItemNumber = '';

    constructor(json?: any) {
        this.companyCode = json?.companyCode;
        this.costCenter = json?.costCenter;
        this.glAccount = json?.glAccount;
        this.lineItemNumber = json?.lineItemNumber;
    }
}
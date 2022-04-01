import {Location} from '../location/location-model';

export interface InvoiceOverviewDetail {
    invoiceNetAmount?: number;
    invoiceDate?: Date;
    paymentDue?: Date;
    freightPaymentTerms?: string;
    billToAddress?: Location;
    carrier?: string;
    carrierMode?:string;
    businessUnit?: string;
    remittanceInformation?: RemittanceInformation;
}

export interface RemittanceInformation {
    erpInvoiceNumber?: string;
    erpRemittanceNumber?: string;
    vendorId?: string;
    amountOfPayment?: number;
    dateOfPayment?: Date;


}

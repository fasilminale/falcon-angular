import {Location} from '../location/location-model';
import {RemitHistoryItem} from "./remit-history-item";

export interface InvoiceOverviewDetail {
    invoiceNetAmount?: number;
    invoiceDate?: Date;
    paymentDue?: Date;
    freightPaymentTerms?: string;
    billToAddress?: Location;
    carrier?: string;
    carrierMode?:string;
    businessUnit?: string;
    remitHistory?: Array<RemitHistoryItem>;
}

export interface RemittanceInformation {
    erpInvoiceNumber?: string;
    erpRemittanceNumber?: string;
    vendorId?: string;
    amountOfPayment?: number;
    dateOfPayment?: Date;


}

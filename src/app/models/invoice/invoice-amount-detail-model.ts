import {CostLineItem, DisputeLineItem} from '../line-item/line-item-model';

export interface InvoiceAmountDetail {
    costLineItems: CostLineItem[];
    pendingChargeLineItems: CostLineItem[];
    deniedChargeLineItems: CostLineItem[];
    disputeLineItems: DisputeLineItem[];
    amountOfInvoice: string;
    currency: string;
    standardPaymentTermsOverride: string;
    mileage: string;
}

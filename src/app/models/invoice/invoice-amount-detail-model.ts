import { CostLineItem } from "../line-item/line-item-model";

export interface InvoiceAmountDetail {
    costLineItems: CostLineItem[],
    amountOfInvoice: string,
    currency: string,
    standardPaymentTermsOverride: string,
    mileage:string
}
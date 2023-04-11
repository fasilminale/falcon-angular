import { Revenue, RevenueTotal } from "./revenue.model";

export interface InvoiceCustomerRevenueDetail {
    totalRevenueAmount: number;
    revenues: Array<Revenue>;
    totalRevenuesPerCustomer?: Array<RevenueTotal>;
}
export interface RemitHistoryItem {
  erpInvoiceNumber: string;
  erpRemittanceNumber: string;
  remitVendorId: string;
  amountOfPayment: number;
  dateOfPayment: string;
  remitStatus: string;
}

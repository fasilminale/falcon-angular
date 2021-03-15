export interface LineItem {
  lineItemNumber: string;
  glAccount: string;
  costCenter: string;
  companyCode: string;
  lineItemNetAmount: number;
  notes: string;
}

export const EMPTY_LINE_ITEM: LineItem =
  {
    lineItemNumber: '',
    glAccount: '',
    costCenter: '',
    companyCode: '',
    lineItemNetAmount: 0,
    notes: ''
  };

import {KeyedLabel} from '../generic/keyed-label';


export class StatusModel implements KeyedLabel {
  public readonly label: string;
  public readonly key: string;

  constructor(json?: any) {
    this.label = json?.label ?? '';
    this.key = json?.key ?? '';
  }
}

export class StatusUtil {

  // Editable Statuses
  static CREATED = 'CREATED';
  static INVOICE_PENDING = 'INVOICE_PENDING';
  static INVOICED = 'INVOICED';
  static REJECTED = 'REJECTED';
  static ERROR = 'ERROR';
  static DISPUTED = 'DISPUTED';
  static EDITABLE_STATUSES = [StatusUtil.CREATED, StatusUtil.INVOICE_PENDING, StatusUtil.INVOICED,
    StatusUtil.REJECTED, StatusUtil.ERROR, StatusUtil.DISPUTED];

  // Deleted Invoice
  static DELETED = 'DELETED';

  // Non-Editable Statuses
  static SUBMITTED = 'SUBMITTED';
  static RESUBMITTED = 'RESUBMITTED';
  static APPROVED = 'APPROVED';
  static NOT_PAYABLE = 'NOT_PAYABLE';
  static PAID = 'PAID';
  static PENDING_EXTRACT = 'PENDING_EXTRACT';
  static PENDING_PAY = 'PENDING_PAY';

  static hasKey(statusKey: string, status: KeyedLabel): boolean {
    return status.key === statusKey;
  }

  static isDeleted(status: KeyedLabel): boolean {
    return status.key === StatusUtil.DELETED;
  }

  static isApproved(status: KeyedLabel): boolean {
    return status.key === StatusUtil.APPROVED;
  }

  static isEditable(status: KeyedLabel): boolean {
    return StatusUtil.EDITABLE_STATUSES.includes(status.key);
  }

}

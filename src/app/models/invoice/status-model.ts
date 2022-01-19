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

  static DELETED = 'DELETED';
  static SUBMITTED = 'SUBMITTED';
  static CREATED = 'CREATED';
  static REJECTED = 'REJECTED';
  static APPROVED = 'APPROVED';

  static hasKey(statusKey: string, status: KeyedLabel): boolean {
    return status.key === statusKey;
  }

  static isDeleted(status: KeyedLabel): boolean {
    return status.key === StatusUtil.DELETED;
  }

  static isSubmitted(status: KeyedLabel): boolean {
    return status.key !== StatusUtil.CREATED
      && status.key !== StatusUtil.REJECTED;
  }

  static isApproved(status: KeyedLabel): boolean {
    return status.key === StatusUtil.APPROVED;
  }

  static isRejected(status: KeyedLabel): boolean {
    return status.key === StatusUtil.REJECTED;
  }

}

import moment from 'moment';
import {InvoiceDataModel} from './invoice-model';

export class InvoiceLockModel {
  static dateFormat = 'MM/DD/YYYY hh:mm z';

  falconInvoiceNumber: string;
  user: string;
  currentUser: boolean;
  dateTimeCreated: string;
  dateTimeExpiration: string;

  constructor(json?: any) {
    this.falconInvoiceNumber = json?.falconInvoiceNumber ?? null;
    this.user = json?.user ?? null;
    this.currentUser = json?.currentUser ?? false;
    this.dateTimeCreated = InvoiceLockModel.date(json?.dateTimeCreated);
    this.dateTimeExpiration = InvoiceLockModel.date(json?.dateTimeExpiration);
  }

  private static date(value?: any, defaultValue: string = ''): string {
    const timezone = moment.tz.guess() || 'America/New_York';
    return value
      ? moment(value).tz(timezone).format(this.dateFormat)
      : defaultValue;
  }
}

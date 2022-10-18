import * as moment from 'moment';
import {InvoiceDataModel} from './invoice-model';

export class HistoryLog {
  static dateFormat = 'MM/DD/YYYY hh:mm z';

  current: boolean;
  fullHistory: boolean;
  field: string;
  action: HistoryLogAction;
  updatedDate: string;
  updatedBy: string;
  updatedTimes: number;
  oldValue: string;
  newValue: string;

  constructor(json?: any) {
    this.current = json?.current ?? false;
    this.fullHistory = json?.fullHistory ?? false;
    this.field = json?.field ?? '';
    this.action = json?.action ?? '';
    this.updatedDate = HistoryLog.date(json?.updatedDate);
    this.updatedBy = json?.updatedBy ?? '';
    this.updatedTimes = json?.updatedTimes ?? 0;
    this.oldValue = HistoryLog.isDate(json?.oldValue) ? HistoryLog.valueDate(json?.oldValue) : json?.oldValue ?? '';
    this.newValue = HistoryLog.isDate(json?.newValue) ? HistoryLog.valueDate(json?.newValue) : json?.newValue ?? '';
  }

  private static date(value?: any, defaultValue: string = ''): string {
    const timezone = moment.tz.guess() || 'America/New_York';
    return value
      ? moment(value).tz(timezone).format(this.dateFormat)
      : defaultValue;
  }

  private static valueDate(value?: any, defaultValue: string = ''): string {
    return value
      ? moment(value).format(InvoiceDataModel.dateFormat)
      : defaultValue;
  }

  private static isDate(value?: any): boolean {
    const date = moment(value).format(InvoiceDataModel.dateFormat);
    return moment(date, InvoiceDataModel.dateFormat, true).isValid();
  }
}

export enum HistoryLogAction {
  ADDED = 'ADDED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED'
}

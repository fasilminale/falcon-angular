import * as moment from 'moment';
import {InvoiceDataModel} from './invoice-model';

export class HistoryLog {
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
    this.oldValue = HistoryLog.isDate(json?.oldValue) ? HistoryLog.date(json?.oldValue) : json?.oldValue ?? '';
    this.newValue = HistoryLog.isDate(json?.newValue) ? HistoryLog.date(json?.newValue) : json?.newValue ?? '';
  }

  private static date(value?: any, defaultValue: string = ''): string {
    return value
      ? moment(value).format(InvoiceDataModel.dateFormat)
      : defaultValue;
  }

  private static isDate(value?: any): boolean {
    const date = moment(value);
    return date.isValid();
  }
}

export enum HistoryLogAction {
  ADDED = 'ADDED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED'
}

import {Injectable} from '@angular/core';
import {DatePickerDataModel} from '../../models/dates/date-picker-data-model';
import {DateTime} from "luxon";
import {DateTimeFormatter} from "../../transforms/date-time-formatter/date-time-formatter";
import {CONSTANTS} from "../../constants/chile-constants";

@Injectable()
export class DateTimeService {
  /**
   * DatePickerDataModel for the loads page. Preserves date picker choices for current app instance.
   */
  loadsDatePickerData: DatePickerDataModel = new DatePickerDataModel();
  /**
   * DatePickerDataModel for the orders pages. Preserves date picker choices for current app instance.
   */
  ordersDatePickerData: DatePickerDataModel = new DatePickerDataModel();
  /**
   * DatePickerDataModel for the loadsByStop pages. Preserves date picker choices for current app instance.
   */
  loadsByStopDatePickerData: DatePickerDataModel = new DatePickerDataModel();

  /**
   * Returns the current Date at the start of the day, in UTC, from DateTime.local().
   */
  get currentDate(): DateTime {
    return DateTime.local().setZone(CONSTANTS.UTC_TZ).startOf("day");
  }
  /**
   * Current Date -7 days. The minimum date of the current WMS work week.
   */
  get minPickDate(): string {
    return DateTimeFormatter.adjustDateIso(this.currentDate.toISO(), {days: -7});
  }
  /**
   * Current Date +7 days. The maximum date of the current WMS work week.
   */
  get maxPickDate(): string {
    return DateTimeFormatter.adjustDateIso(this.currentDate.toISO(), {days: 7});
  }
  /**
   * Current Date -14 days. The minimum date for advanced search.
   */
  get expandedMinPickDate(): string {
    return DateTimeFormatter.adjustDateIso(this.currentDate.toISO(), {days: -14});
  }
  /**
   * Current Date +14 days. The maximum date for advanced search.
   */
  get expandedMaxPickDate(): string {
    return DateTimeFormatter.adjustDateIso(this.currentDate.toISO(), {days: 14});
  }
  /**
   * Returns the number of months to display in a date picker if the min start and end dates span 2 months.
   */
  getNumberOfCalendarMonths(startDate: string = this.minPickDate, endDate: string = this.maxPickDate): number {
    const startDateTime = DateTimeFormatter.normalizeDatetime(startDate, CONSTANTS.UTC_TZ);
    const endDateTime = DateTimeFormatter.normalizeDatetime(endDate, CONSTANTS.UTC_TZ);
    const differentMonths = startDateTime?.month !== endDateTime?.month
    return differentMonths ? 2 : 1;
  }
  /**
   * Returns the current date/time in a localized MM/DD/YYYY HH:mm z format.
   */
  getCurrentDateTime(): string {
    return  DateTime.local().toFormat('f', {locale: DateTimeFormatter.getClientLocale()});
  }

}

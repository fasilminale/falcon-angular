import {Inject, Injectable, Optional} from '@angular/core';
import * as moment from 'moment-timezone';

export type formatType = 'imperial' | 'metric' | 'iso' | 'stopPage';

@Injectable()
export class TimeService {
  private apiTimeFormat = 'YYYY-MM-DD HH:mm:ss Z';
  private outputFormatToFormatStringMap = {
    imperial: 'MM-DD-YYYY HH:mm z',
    metric: 'DD-MM-YYYY HH:mm z',
    iso: 'YYYY-MM-DD HH:mm z',
    stopPage: 'ddd, MMM DD, YYYY'
  };

  private readonly timezone: string = '';

  constructor(@Optional() @Inject('') timezone?: string) {
    this.timezone = timezone || moment.tz.guess();
  }

  convertFromApiTime(time?: string, timeZone?: string, outputFormat?: formatType): string {
    if (!time) {
      return '';
    }
    const outputFormatString = this.outputFormatToFormatStringMap[outputFormat ?? 'imperial']
      ?? this.outputFormatToFormatStringMap.imperial;
    if (!timeZone) {
      timeZone = 'UTC';
    }
    const formattedTime = moment.utc(time, this.apiTimeFormat).tz(timeZone);
    return formattedTime.format(outputFormatString);
  }

  get getTimezone(): string {
    return this.timezone;
  }

  public formatTimestamp(value: string, format: string): string | undefined {
    return moment.tz(value, this.timezone).format(format);
  }
}

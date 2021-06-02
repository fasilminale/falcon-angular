import {Inject, Injectable, Optional} from '@angular/core';
import * as moment from 'moment-timezone';

@Injectable()
export class TimeService {

  private readonly timezone: string = '';

  constructor(@Optional() @Inject('') timezone?: string) {
    this.timezone = timezone || moment.tz.guess();
  }

  get getTimezone(): string {
    return this.timezone;
  }

  public formatTimestamp(value: string, format: string): string | undefined {
    return moment.tz(value, this.timezone).format(format);
  }
}

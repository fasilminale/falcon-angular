import {TestBed} from '@angular/core/testing';
import {TimeService} from './time-service';
import * as moment from 'moment-timezone';
import {FalconTestingModule} from '../testing/falcon-testing.module';

describe('TimeService', () => {

  let time: TimeService;
  const testTimestamp = '2021-05-14T11:01:58.135Z';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FalconTestingModule],
    });
  });

  // TIMEZONE PROVIDED
  describe('Timezone Provided', () => {
    beforeEach(() => {
      time = new TimeService('America/New_York');
    });
    it('should create', () => {
      expect(time).toBeTruthy();
    });
    it('should format a timestamp', () => {
      const actual = time.formatTimestamp(testTimestamp, 'hh:mm');
      expect(actual).toEqual('07:01');
    });
    it('should get the timezone', () => {
      const actual = time.getUserTimezone;
      expect(actual).toEqual('America/New_York');
    });
  });

  // NO TIMEZONE PROVIDED
  describe('No Timezone Provided', () => {
    beforeEach(async () => {
      time = new TimeService();
    });
    it('should create', () => {
      expect(time).toBeTruthy();
    });
    it('should format a timestamp using the set timezone', () => {
      const actual = time.formatTimestamp(testTimestamp, 'hh:mm');
      const expected = moment.tz(testTimestamp, time.getUserTimezone).format('hh:mm');
      expect(actual).toEqual(expected);
    });
  });

  describe('convertFromApiTime', () => {
    const year = 2020;
    const month = '04';
    const day = 15;
    const hours = 20;
    const minutes = 57;
    const seconds = 56;
    const baseUtcOffset = '+0000';
    const timeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${baseUtcOffset}`;

    it('should convert provided timeString to provided timeZone: undefined', () => {
      // Output should be in UTC
      expect(time.convertFromApiTime(timeString, undefined))
        .toEqual(`${month}-${day}-${year} ${hours}:${minutes} UTC`);
      expect(time.convertFromApiTime(timeString, undefined, 'iso'))
        .toEqual(`${year}-${month}-${day} ${hours}:${minutes} UTC`);
      expect(time.convertFromApiTime(timeString, undefined, 'imperial'))
        .toEqual(`${month}-${day}-${year} ${hours}:${minutes} UTC`);
      expect(time.convertFromApiTime(timeString, undefined, 'metric'))
        .toEqual(`${day}-${month}-${year} ${hours}:${minutes} UTC`);
    });

    it('should convert provided timeString to provided timeZone: US/Pacific', () => {
      // PDT is GMT -7
      const newHours = hours - 7;
      expect(time.convertFromApiTime(timeString, 'US/Pacific'))
        .toEqual(`${month}-${day}-${year} ${newHours}:${minutes} PDT`);
      expect(time.convertFromApiTime(timeString, 'US/Pacific', 'iso'))
        .toEqual(`${year}-${month}-${day} ${newHours}:${minutes} PDT`);
      expect(time.convertFromApiTime(timeString, 'US/Pacific', 'imperial'))
        .toEqual(`${month}-${day}-${year} ${newHours}:${minutes} PDT`);
      expect(time.convertFromApiTime(timeString, 'US/Pacific', 'metric'))
        .toEqual(`${day}-${month}-${year} ${newHours}:${minutes} PDT`);
    });

    it('should convert provided timeString to provided timeZone: America/New_York', () => {
      // EST is GMT -4
      const newHours = hours - 4;
      expect(time.convertFromApiTime(timeString, 'America/New_York'))
        .toEqual(`${month}-${day}-${year} ${newHours}:${minutes} EDT`);
      expect(time.convertFromApiTime(timeString, 'America/New_York', 'iso'))
        .toEqual(`${year}-${month}-${day} ${newHours}:${minutes} EDT`);
      expect(time.convertFromApiTime(timeString, 'America/New_York', 'imperial'))
        .toEqual(`${month}-${day}-${year} ${newHours}:${minutes} EDT`);
      expect(time.convertFromApiTime(timeString, 'America/New_York', 'metric'))
        .toEqual(`${day}-${month}-${year} ${newHours}:${minutes} EDT`);
    });

    it('should convert provided timeString to provided timeZone: Asia/Shanghai', () => {
      // CST is GMT +8
      const newHours = '0' + (hours - 16);
      const newDay = day + 1;
      expect(time.convertFromApiTime(timeString, 'Asia/Shanghai'))
        .toEqual(`${month}-${newDay}-${year} ${newHours}:${minutes} CST`);
      expect(time.convertFromApiTime(timeString, 'Asia/Shanghai', 'iso'))
        .toEqual(`${year}-${month}-${day + 1} ${newHours}:${minutes} CST`);
      expect(time.convertFromApiTime(timeString, 'Asia/Shanghai', 'imperial'))
        .toEqual(`${month}-${day + 1}-${year} ${newHours}:${minutes} CST`);
      expect(time.convertFromApiTime(timeString, 'Asia/Shanghai', 'metric'))
        .toEqual(`${day + 1}-${month}-${year} ${newHours}:${minutes} CST`);
    });

    it('should not make any change when there is no provided time', () => {
      expect(time.convertFromApiTime('')).toEqual('');
      expect(time.convertFromApiTime(undefined)).toEqual('');
    });
  });

});

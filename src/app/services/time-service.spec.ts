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
      const actual = time.getTimezone;
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
      const expected = moment.tz(testTimestamp, time.getTimezone).format('hh:mm');
      expect(actual).toEqual(expected);
    });
  });

});

import {TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TimeService} from './time-service';
import * as moment from 'moment-timezone';

describe('UtilService Tests', () => {
  let time: TimeService;

  const testTimestamp = '2021-05-14T11:01:58.135Z';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: TimeService, useFactory: () => {
            return new TimeService('America/New_York');
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    time = TestBed.inject(TimeService);
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

describe('UtilService Tests with no specified timezone', () => {
  let time: TimeService;

  const testTimestamp = '2021-05-14T11:01:58.135Z';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [TimeService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    time = TestBed.inject(TimeService);
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

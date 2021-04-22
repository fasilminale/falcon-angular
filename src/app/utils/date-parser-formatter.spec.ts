import { TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DateParserFormatter } from './date-parser-formatter';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

describe('DateParserFormatter Tests', () => {
  let dateParserFormatter: DateParserFormatter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        DateParserFormatter,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    dateParserFormatter = TestBed.inject(DateParserFormatter);
  });

  it('should create', () => {
    expect(dateParserFormatter).toBeTruthy();
  });

  it('Should parse method work', () => {
    let date = dateParserFormatter.parse('');
    expect(date.year).toEqual(0);

    date = dateParserFormatter.parse('1-1');
    expect(date.year).toEqual(0);

    date = dateParserFormatter.parse('1-1-2021');
    expect(date.year).toEqual(2021);
  });

  it('Should format method work', () => {
    let date: NgbDateStruct = { year: 0, month: 0, day: 0 };
    let dateString = dateParserFormatter.format(date);
    expect(dateString).toEqual('');

    date = { year: 2021, month: 1, day: 1 };
    dateString = dateParserFormatter.format(date);
    expect(dateString).toEqual('01-01-2021');

    date = { year: 2021, month: 10, day: 20 };
    dateString = dateParserFormatter.format(date);
    expect(dateString).toEqual('10-20-2021');
  });
});

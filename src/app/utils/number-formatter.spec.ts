import {NumberFormatter} from './number-formatter';

describe('truncateData', () => {
  it('should properly truncate data', () => {
    expect(NumberFormatter.truncateData(0)).toEqual(0);
    expect(NumberFormatter.truncateData(0.5)).toEqual(0.5);
    expect(NumberFormatter.truncateData(0.55)).toEqual(0.55);
    expect(NumberFormatter.truncateData(0.554)).toEqual(0.554);
    expect(NumberFormatter.truncateData(0.555)).toEqual(0.555);
    expect(NumberFormatter.truncateData(0.5554)).toEqual(0.555);
    expect(NumberFormatter.truncateData(0.5555)).toEqual(0.556);
  });
});



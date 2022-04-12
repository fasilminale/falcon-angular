import { Injectable } from '@angular/core';


@Injectable()
export class NumberFormatter {
  /**
   * Truncates data to the nearest 3rd decimal place and rounds up.
   * @param inputData - The data to be truncated.
   */
  static truncateData(inputData: number): number {
    if (this.getNumDecimalPlaces(inputData) > 3) {
      return (Math.round((inputData + Number.EPSILON) * 1000) / 1000);
    } else {
      return inputData;
    }
  }

  /**
   * Calculates the number of decimal places in a number from a number or string including scientific notation.
   * @param num - Number of String to be analysed
   * @private
   */
  static getNumDecimalPlaces(num: number | string): number {
    const match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match) {
      return 0;
    }
    return Math.max(
      0,
      // Number of digits right of decimal point.
      (match[1] ? match[1].length : 0)
      // Adjust for scientific notation.
      - (match[2] ? +match[2] : 0));
  }

}


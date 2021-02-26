import {isInvoice, EXAMPLE_INVOICE} from './invoice-model';

describe('Invoice Model Tests', () => {

  it('should pass invoice check', () => {
    expect(isInvoice(EXAMPLE_INVOICE)).toBe(true);
  });

  it('should fail invoice check', () => {
    const badInvoiceData = {
      notAnInvoice: true
    };
    expect(isInvoice(badInvoiceData)).toBe(false);
  });

});

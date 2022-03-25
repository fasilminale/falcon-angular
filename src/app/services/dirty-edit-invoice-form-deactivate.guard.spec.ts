import createSpyObj = jasmine.createSpyObj;
import {Observable, of, Subscription} from 'rxjs';
import {DirtyInvoiceEditFormGuard} from './dirty-edit-invoice-form-deactivate.guard';

describe('DirtyInvoiceEditFormGuard', () => {

  let invoiceFormComponentSpy: any;
  let invoiceDetailPageComponentSpy: any;

  let subscription: Subscription;

  const setUpSpies = (pristine: boolean, dialogReturn: boolean, invoiceFormUndefined: boolean) => {
    invoiceFormComponentSpy = createSpyObj('InvoiceFormComponent Spy',
      ['askForCancelConfirmation'],
      {isFormPristine: pristine});
    invoiceDetailPageComponentSpy = createSpyObj('InvoiceDetailPageComponent Spy',
      [''],
      {invoiceForm: invoiceFormUndefined ? undefined : invoiceFormComponentSpy});
    invoiceFormComponentSpy.askForCancelConfirmation.and.returnValue(of(dialogReturn));
  };

  beforeEach(() => {
    subscription = new Subscription();
  });

  afterEach(() => {
    subscription.unsubscribe();
  });

  it('should return true Observable when canDeactivate invoked and form is pristine', (done) => {
    setUpSpies(true, false, false);
    const guard: DirtyInvoiceEditFormGuard = new DirtyInvoiceEditFormGuard();

    const result: Observable<boolean> = guard.canDeactivate(invoiceDetailPageComponentSpy);

    subscription.add(result.subscribe(
      (transition) => {
        expect(transition).toBeTrue();
        done();
      },
      () => fail('Test should return Observable')
    ));
  });

  it('should return true Observable when canDeactivate invoked, form is not pristine and dialog returns true', (done) => {
    setUpSpies(false, true, false);
    const guard: DirtyInvoiceEditFormGuard = new DirtyInvoiceEditFormGuard();

    const result: Observable<boolean> = guard.canDeactivate(invoiceDetailPageComponentSpy);

    subscription.add(result.subscribe(
      (transition) => {
        expect(transition).toBeTrue();
        done();
      },
      () => fail('Test should return Observable')
    ));
  });

  it('should return false Observable when canDeactivate invoked, form is not pristine and dialog returns false', (done) => {
    setUpSpies(false, false, false);
    const guard: DirtyInvoiceEditFormGuard = new DirtyInvoiceEditFormGuard();

    const result: Observable<boolean> = guard.canDeactivate(invoiceDetailPageComponentSpy);

    subscription.add(result.subscribe(
      (transition) => {
        expect(transition).toBeFalse();
        done();
      },
      () => fail('Test should return Observable')
    ));
  });

  it('should return true Observable when canDeactivate invoked and invoice form is undefined', (done) => {
    setUpSpies(false, false, true);
    const guard: DirtyInvoiceEditFormGuard = new DirtyInvoiceEditFormGuard();

    const result: Observable<boolean> = guard.canDeactivate(invoiceDetailPageComponentSpy);

    subscription.add(result.subscribe(
      (transition) => {
        expect(transition).toBeTrue();
        done();
      },
      () => fail('Test should return Observable')
    ));
  });
});

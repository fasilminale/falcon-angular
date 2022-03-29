import createSpyObj = jasmine.createSpyObj;
import {DirtyInvoiceCreateFormGuard} from './dirty-create-invoice-form-deactivate.guard';
import {Observable, of, Subscription} from 'rxjs';

describe('DirtyInvoiceCreateFormGuard', () => {

  let invoiceFormComponentSpy: any;
  let invoiceCreatePageComponentSpy: any;
  const currentRouteSpy = createSpyObj('currentRouteSpy', ['']);
  const currentStateSpy = createSpyObj('currentStateSpy', ['']);
  const nextStateSpy = createSpyObj('nextStateSpy', [''], {url: 'qwerty'});

  let subscription: Subscription;

  const setUpSpies = (pristine: boolean, dialogReturn: boolean) => {
    invoiceFormComponentSpy = createSpyObj('InvoiceFormComponent Spy',
      ['askForCancelConfirmation'],
      {isFormPristine: pristine});
    invoiceCreatePageComponentSpy = createSpyObj('InvoiceCreatePageComponent Spy',
      [''],
      {formComponent: invoiceFormComponentSpy});
    invoiceFormComponentSpy.askForCancelConfirmation.and.returnValue(of(dialogReturn));
  };

  beforeEach(() => {
    subscription = new Subscription();
  });

  afterEach(() => {
    subscription.unsubscribe();
  });

  it('should return true Observable when canDeactivate invoked and form is pristine', (done) => {
    setUpSpies(true, false);
    const guard: DirtyInvoiceCreateFormGuard = new DirtyInvoiceCreateFormGuard();

    const result: Observable<boolean> = guard.canDeactivate(invoiceCreatePageComponentSpy, currentRouteSpy, currentStateSpy, nextStateSpy );

    subscription.add(result.subscribe(
      (transition) => {
        expect(transition).toBeTrue();
        done();
      },
    () => fail('Test should return Observable')
    ));
  });

  it('should return true Observable when canDeactivate invoked, form is not pristine and dialog returns true', (done) => {
    setUpSpies(false, true);
    const guard: DirtyInvoiceCreateFormGuard = new DirtyInvoiceCreateFormGuard();

    const result: Observable<boolean> = guard.canDeactivate(invoiceCreatePageComponentSpy, currentRouteSpy, currentStateSpy, nextStateSpy );

    subscription.add(result.subscribe(
      (transition) => {
        expect(transition).toBeTrue();
        done();
      },
      () => fail('Test should return Observable')
    ));
  });

  it('should return false Observable when canDeactivate invoked, form is not pristine and dialog returns false', (done) => {
    setUpSpies(false, false);
    const guard: DirtyInvoiceCreateFormGuard = new DirtyInvoiceCreateFormGuard();

    const result: Observable<boolean> = guard.canDeactivate(invoiceCreatePageComponentSpy, currentRouteSpy, currentStateSpy, nextStateSpy );

    subscription.add(result.subscribe(
      (transition) => {
        expect(transition).toBeFalse();
        done();
      },
      () => fail('Test should return Observable')
    ));
  });
});

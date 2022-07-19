import createSpyObj = jasmine.createSpyObj;
import {Observable, of, Subscription} from 'rxjs';
import {DirtyAutoInvoiceEditFormGuard} from './dirty-edit-auto-invoice-form-deactivate.guard';

describe('DirtyInvoiceAutoEditFormGuard', () => {

  let invoiceEditPageComponentSpy: any;
  const currentRouteSpy = createSpyObj('currentRouteSpy', ['']);
  const currentStateSpy = createSpyObj('currentStateSpy', ['']);
  const nextStateSpy = createSpyObj('nextStateSpy', [''], {url: 'qwerty'});

  let subscription: Subscription;

  const setUpSpies = (editMode: boolean, pristine: boolean, dialogReturn: boolean, invoiceFormUndefined: boolean) => {
    invoiceEditPageComponentSpy = createSpyObj('InvoiceEditPageComponent Spy',
      ['askForCancelConfirmation'],
      {isGlobalEditMode$: { value: editMode }, invoiceFormGroup: invoiceFormUndefined ? undefined : {pristine}});
    invoiceEditPageComponentSpy.askForCancelConfirmation.and.returnValue(of(dialogReturn));
  };

  beforeEach(() => {
    subscription = new Subscription();
  });

  afterEach(() => {
    subscription.unsubscribe();
  });

  it('should return true Observable when canDeactivate invoked and form is not in edit mode', (done) => {
    setUpSpies(false, true, false, false);
    const guard: DirtyAutoInvoiceEditFormGuard = new DirtyAutoInvoiceEditFormGuard();

    const result: Observable<boolean> = guard.canDeactivate(invoiceEditPageComponentSpy, currentRouteSpy, currentStateSpy, nextStateSpy);

    subscription.add(result.subscribe(
      (transition) => {
        expect(transition).toBeTrue();
        done();
      },
      () => fail('Test should return Observable')
    ));
  });

  it('should return true Observable when canDeactivate invoked and form is not pristine but not in edit mode', (done) => {
    setUpSpies(false, false, false, false);
    const guard: DirtyAutoInvoiceEditFormGuard = new DirtyAutoInvoiceEditFormGuard();

    const result: Observable<boolean> = guard.canDeactivate(invoiceEditPageComponentSpy, currentRouteSpy, currentStateSpy, nextStateSpy);

    subscription.add(result.subscribe(
      (transition) => {
        expect(transition).toBeTrue();
        done();
      },
      () => fail('Test should return Observable')
    ));
  });

  it('should return true Observable when canDeactivate invoked and dialog returns false', (done) => {
    setUpSpies(true, false, false, false);
    const guard: DirtyAutoInvoiceEditFormGuard = new DirtyAutoInvoiceEditFormGuard();

    const result: Observable<boolean> = guard.canDeactivate(invoiceEditPageComponentSpy, currentRouteSpy, currentStateSpy, nextStateSpy);

    subscription.add(result.subscribe(
      (transition) => {
        expect(transition).toBeFalse();
        done();
      },
      () => fail('Test should return Observable')
    ));
  });

  it('should return false Observable when canDeactivate invoked and dialog returns true', (done) => {
    setUpSpies(true, false, true, false);
    const guard: DirtyAutoInvoiceEditFormGuard = new DirtyAutoInvoiceEditFormGuard();

    const result: Observable<boolean> = guard.canDeactivate(invoiceEditPageComponentSpy, currentRouteSpy, currentStateSpy, nextStateSpy);

    subscription.add(result.subscribe(
      (transition) => {
        expect(transition).toBeTrue();
        done();
      },
      () => fail('Test should return Observable')
    ));
  });

  it('should return true Observable when canDeactivate invoked and invoice form is undefined', (done) => {
    setUpSpies(false, true, false, true);
    const guard: DirtyAutoInvoiceEditFormGuard = new DirtyAutoInvoiceEditFormGuard();

    const result: Observable<boolean> = guard.canDeactivate(invoiceEditPageComponentSpy, currentRouteSpy, currentStateSpy, nextStateSpy);

    subscription.add(result.subscribe(
      (transition) => {
        expect(transition).toBeTrue();
        done();
      },
      () => fail('Test should return Observable')
    ));
  });
});

import {TestBed} from '@angular/core/testing';
import {SubscriptionManager} from '../../services/subscription-manager';
import {InvoiceFormManager} from './invoice-form-manager';
import {AbstractControl, FormControl} from '@angular/forms';
import Spy = jasmine.Spy;
import {FalconTestingModule} from '../../testing/falcon-testing.module';

describe('InvoiceFormManager', () => {

  let invoiceFormManager: InvoiceFormManager;
  let subscriptionManager: SubscriptionManager;

  function createSpyFormControl(): FormControl {
    const formControl = new FormControl();
    spyOn(formControl.statusChanges, 'subscribe').and.callThrough();
    spyOn(formControl.valueChanges, 'subscribe').and.callThrough();
    spyOn(formControl, 'markAsTouched').and.callThrough();
    spyOn(formControl, 'setValue').and.callThrough();
    return formControl;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [FalconTestingModule]});
    invoiceFormManager = TestBed.inject(InvoiceFormManager);
    // stub these so they don't trigger cascading events during tests
    // they are tested for their functionality in isolation.
    spyOn(invoiceFormManager, 'forceValueChangeEvent').and.stub();
    spyOn(invoiceFormManager, 'establishTouchLink').and.stub();
    subscriptionManager = TestBed.inject(SubscriptionManager);
    spyOn(subscriptionManager, 'manage').and.callThrough();
  });

  // BEFORE INIT TESTS
  describe('when constructed, before init is called', () => {
    it('should create', () => {
      expect(invoiceFormManager).toBeTruthy();
    });
    it('should have 0 line items', () => {
      expect(invoiceFormManager.lineItems.length).toEqual(0);
    });
    it('should have total line item net amount of 0', () => {
      expect(invoiceFormManager.totalLineItemNetAmount).toEqual(0);
    });
  });

  // AFTER INIT TESTS
  describe('during initialization', () => {
    describe('given 1 template option', () => {
      beforeEach(() => {
        invoiceFormManager.myTemplateOptions.push('some template option');
      });
      it('should have 1 template option', () => {
        expect(invoiceFormManager.myTemplateOptions.length).toEqual(1);
      });
      describe('after init is called', () => {
        beforeEach(() => {
          invoiceFormManager.init();
        });
        it('should have enabled selected template control', () => {
          expect(invoiceFormManager.selectedTemplate.enabled).toBeTrue();
        });
      });
    });
    describe('given 0 template options', () => {
      it('should have 0 template options', () => {
        expect(invoiceFormManager.myTemplateOptions.length).toEqual(0);
      });
      describe('after init is called', () => {
        beforeEach(() => {
          invoiceFormManager.init();
        });
        it('should establish connections', () => {
          expect(invoiceFormManager.establishTouchLink).toHaveBeenCalledTimes(10);
        });
        it('should still have 0 line items', () => {
          expect(invoiceFormManager.lineItems.length).toEqual(0);
        });
        it('should have disabled selected template control', () => {
          expect(invoiceFormManager.selectedTemplate.disabled).toBeTrue();
        });
        // PAYMENT TERMS TESTS
        describe('given a payment override is selected', () => {
          beforeEach(() => {
            invoiceFormManager.isPaymentOverrideSelected.setValue(true);
          });
          it(', payment override should be selected', () => {
            expect(invoiceFormManager.isPaymentOverrideSelected.value).toBeTrue();
          });
          describe('and payment terms are present', () => {
            beforeEach(() => {
              invoiceFormManager.paymentTerms.setValue('some payment terms');
            });
            it(', payment terms should have value', () => {
              expect(invoiceFormManager.paymentTerms.value).toEqual('some payment terms');
            });
            describe(', then payment override is unselected', () => {
              beforeEach(() => {
                invoiceFormManager.isPaymentOverrideSelected.setValue(false);
              });
              it(', payment override should be unselected', () => {
                expect(invoiceFormManager.isPaymentOverrideSelected.value).toBeFalse();
              });
              it(', payment terms should be cleared', () => {
                expect(invoiceFormManager.paymentTerms.value).toBeNull();
              });
            });
          });
        });
        // LINE ITEM TESTS
        describe('when an empty line item is added', () => {
          beforeEach(() => {
            spyOn(invoiceFormManager, 'calculateLineItemNetAmount').and.callThrough();
            invoiceFormManager.addNewEmptyLineItem();
          });
          it('should now have 1 line item', () => {
            expect(invoiceFormManager.lineItems.length).toEqual(1);
          });
          it('should have called calculateLineItemNetAmount once', () => {
            expect(invoiceFormManager.calculateLineItemNetAmount).toHaveBeenCalledTimes(1);
          });
          it('should be able to get line item group', () => {
            expect(invoiceFormManager.lineItemGroup(0)).toBeTruthy();
          });
          describe('and the line item is removed', () => {
            beforeEach(() => {
              invoiceFormManager.removeLineItem(0);
            });
            it('should now have 0 line items', () => {
              expect(invoiceFormManager.lineItems.length).toEqual(0);
            });
            it('should have called calculateLineItemNetAmount twice', () => {
              expect(invoiceFormManager.calculateLineItemNetAmount).toHaveBeenCalledTimes(2);
            });
          });
          describe('and the line item\'s company code is set', () => {
            beforeEach(() => {
              invoiceFormManager.lineItemGroup(0).controls.companyCode.setValue('company code');
            });
            it('should be able to get line item\'s company code', () => {
              expect(invoiceFormManager.lineItemCompanyCode(0).value).toEqual('company code');
            });
            it('should have called calculateLineItemNetAmount twice', () => {
              expect(invoiceFormManager.calculateLineItemNetAmount).toHaveBeenCalledTimes(2);
            });
          });
          describe('and the line item\'s cost center is set', () => {
            beforeEach(() => {
              invoiceFormManager.lineItemGroup(0).controls.costCenter.setValue('cost center');
            });
            it('should be able to get line item\'s cost center', () => {
              expect(invoiceFormManager.lineItemCostCenter(0).value).toEqual('cost center');
            });
            it('should have called calculateLineItemNetAmount twice', () => {
              expect(invoiceFormManager.calculateLineItemNetAmount).toHaveBeenCalledTimes(2);
            });
          });
          describe('and the line item\'s GL account is set', () => {
            beforeEach(() => {
              invoiceFormManager.lineItemGroup(0).controls.glAccount.setValue('gl account');
            });
            it('should be able to get line item\'s GL account', () => {
              expect(invoiceFormManager.lineItemGlAccount(0).value).toEqual('gl account');
            });
            it('should have called calculateLineItemNetAmount twice', () => {
              expect(invoiceFormManager.calculateLineItemNetAmount).toHaveBeenCalledTimes(2);
            });
          });
          describe('and the line item\'s net amount is set', () => {
            beforeEach(() => {
              invoiceFormManager.lineItemGroup(0).controls.lineItemNetAmount.setValue('net amount');
            });
            it('should be able to get line item\'s net amount', () => {
              expect(invoiceFormManager.lineItemNetAmount(0).value).toEqual('net amount');
            });
            it('should have called calculateLineItemNetAmount twice', () => {
              expect(invoiceFormManager.calculateLineItemNetAmount).toHaveBeenCalledTimes(2);
            });
          });
          describe('and the line item\'s notes is set', () => {
            beforeEach(() => {
              invoiceFormManager.lineItemGroup(0).controls.notes.setValue('notes');
            });
            it('should be able to get line item\'s notes', () => {
              expect(invoiceFormManager.lineItemNotes(0).value).toEqual('notes');
            });
            it('should have called calculateLineItemNetAmount twice', () => {
              expect(invoiceFormManager.calculateLineItemNetAmount).toHaveBeenCalledTimes(2);
            });
          });
        });
      });
    });
  });

  // ESTABLISH TOUCH LINK TESTS
  describe('given two form controls A and B', () => {
    let controlA: AbstractControl;
    let controlB: AbstractControl;
    beforeEach(() => {
      // un-stubbed for isolated testing
      (invoiceFormManager.establishTouchLink as Spy).and.callThrough();
      controlA = createSpyFormControl();
      controlB = createSpyFormControl();
    });
    it(', control A should be untouched', () => {
      expect(controlA.untouched).toBeTrue();
    });
    it(', control B should be untouched', () => {
      expect(controlB.untouched).toBeTrue();
    });
    describe('when establishTouchLink is called on them', () => {
      beforeEach(() => {
        invoiceFormManager.establishTouchLink(controlA, controlB);
      });
      it('should use subscription manager', () => {
        expect(subscriptionManager.manage).toHaveBeenCalled();
      });
      it('should subscribe to control A\'s valueChanges', () => {
        expect(controlA.valueChanges.subscribe).toHaveBeenCalled();
      });
      it('should NOT subscribe to control B\'s valueChanges', () => {
        expect(controlB.valueChanges.subscribe).not.toHaveBeenCalled();
      });
      describe('then control A\'s value is changed', () => {
        beforeEach(() => {
          controlA.setValue('some value');
        });
        it(', control B should be marked as touched', () => {
          expect(controlB.markAsTouched).toHaveBeenCalled();
        });
        it(', control B should be touched', () => {
          expect(controlB.touched).toBeTrue();
        });
        it(', control B should have value change event forced', () => {
          expect(invoiceFormManager.forceValueChangeEvent).toHaveBeenCalledOnceWith(controlB);
        });
        describe('then control A\'s value is changed AGAIN', () => {
          beforeEach(() => {
            controlA.setValue('some other value');
          });
          it(', control B should NOT be marked as touched AGAIN', () => {
            expect(controlB.markAsTouched).toHaveBeenCalledTimes(1);
          });
          it(', control B should STILL be touched', () => {
            expect(controlB.touched).toBeTrue();
          });
          it(', control B should NOT have value change event forced AGAIN', () => {
            expect(invoiceFormManager.forceValueChangeEvent).toHaveBeenCalledTimes(1);
          });
        });
      });
    });
  });

  // FORCE VALUE CHANGE EVENT TESTS
  describe('when forceValueChangeEvent is called', () => {
    let control: AbstractControl;
    beforeEach(() => {
      // un-stubbed for isolated testing
      (invoiceFormManager.forceValueChangeEvent as Spy).and.callThrough();
      control = createSpyFormControl();
      invoiceFormManager.forceValueChangeEvent(control);
    });
    it('should make a redundant setValue call', () => {
      expect(control.setValue).toHaveBeenCalledOnceWith(control.value);
    });
  });

});

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FalPageHeaderComponent} from './fal-page-header.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {By} from '@angular/platform-browser';
import {NavigationModule} from '@elm/elm-styleguide-ui';
import {UtilService} from '../../services/util-service';
import {Observable, of} from 'rxjs';
import {EditStatusModalInput, NewStatusModalOutput} from '../fal-edit-status-modal/fal-edit-status-modal.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {UserService} from '../../services/user-service';
import {InvoiceLockService} from '../../services/invoice-lock-service';
import {UserInfoModel} from '../../models/user-info/user-info-model';
import {ElmUamPermission} from '../../utils/elm-uam-permission';
import {EnvironmentService} from '../../services/environment-service/environment-service';
import {InvoiceLockModel} from '../../models/invoice/invoice-lock-model';
import {InvoiceService} from '../../services/invoice-service';

describe('FalPageHeaderComponent', () => {
  let component: FalPageHeaderComponent;
  let fixture: ComponentFixture<FalPageHeaderComponent>;
  let invoiceLockServiceRef: InvoiceLockService;
  let invoiceServiceRef: InvoiceService;
  let utilServiceRef: UtilService;

  const MOCK_EDIT_MODAL = {
    openNewStatusEditModal: (data: EditStatusModalInput): Observable<NewStatusModalOutput>  => {
      return of({});

    }
  };

  const MOCK_USER_SERVICE_WITH_PERMISSION = {
    getUserInfo: (): Observable<UserInfoModel> => {
      let userInfo = new UserInfoModel();
      userInfo.permissions = [ElmUamPermission.ALLOW_EDIT_STATUS];
      return of(userInfo);
    }
  }

  const MOCK_USER_SERVICE_WITHOUT_PERMISSION = {
    getUserInfo: (): Observable<UserInfoModel> => {
      let userInfo = new UserInfoModel();
      userInfo.permissions = [];
      return of(userInfo);
    }
  }

  const MOCK_ENVIRONMENT_SERVICE = {
    showFeature: (feature: string): boolean => {
      return true;
    },

    getFeatures: (): Promise<any> => {
      return new Promise<void>(resolve => resolve());
    }
  };

  const MOCK_ENVIRONMENT_SERVICE_FEATURE_TURNED_OFF = {
    showFeature: (feature: string): boolean => {
      return false;
    },

    getFeatures: (): Promise<any> => {
      return new Promise<void>(resolve => resolve());
    }
  };

  const MOCK_INVOICE_LOCK_SERVICE_LOCKED_BY_DIFFERENT_USER = {
    retrieveInvoiceLock: (invoiceNumber: string): any => {
      return of(true);
    },
    getInvoiceLock: (): InvoiceLockModel => {
      let invoiceLockModel = new InvoiceLockModel();
      invoiceLockModel.currentUser = false;

      return invoiceLockModel
    },
    releaseInvoiceLock: (): void => {},
    createInvoiceLock: (invoiceNumber: string): void => {}
  };

  const MOCK_INVOICE_LOCK_SERVICE_LOCKED_BY_CURRENT_USER = {
    retrieveInvoiceLock: (invoiceNumber: string): any => {
      return of(true);
    },
    getInvoiceLock: (): InvoiceLockModel => {
      let invoiceLockModel = new InvoiceLockModel();
      invoiceLockModel.currentUser = true;
      return invoiceLockModel
    },
    releaseInvoiceLock: (): void => {},
    createInvoiceLock: (invoiceNumber: string): void => {}
  };

  const MOCK_INVOICE_LOCK_SERVICE_NO_LOCK = {
    retrieveInvoiceLock: (invoiceNumber: string): any => {
      return of(false);
    },
    getInvoiceLock: (): InvoiceLockModel => {
      let invoiceLockModel = new InvoiceLockModel();
      invoiceLockModel.currentUser = true;
      return invoiceLockModel
    },
    releaseInvoiceLock: (): void => {},
    createInvoiceLock: (invoiceNumber: string): void => {}
  };


  const MOCK_INVOICE_SERVICE = {
    getAllowedStatuses: (falconInvoiceNumber: string): any => {
      return of([
        {
          "key": "NOT_PAYABLE",
          "label": "Not Payable"
        },
        {
          "key": "ERROR",
          "label": "Error"
        }
      ]);
    }
  };

  const MOCK_INVOICE_SERVICE_NO_STATUSES = {
    getAllowedStatuses: (falconInvoiceNumber: string): any => {
      return of([]);
    }
  };

  const setup = () => {
    TestBed.compileComponents();
    fixture = TestBed.createComponent(FalPageHeaderComponent);
    invoiceLockServiceRef = TestBed.inject(InvoiceLockService);
    invoiceServiceRef = TestBed.inject(InvoiceService);
    utilServiceRef = TestBed.inject(UtilService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FalPageHeaderComponent],
      providers: [{provide: UtilService, useValue: MOCK_EDIT_MODAL},
                  {provide: InvoiceLockService, useValue: MOCK_INVOICE_LOCK_SERVICE_NO_LOCK},
                  {provide: UserService, useValue: MOCK_USER_SERVICE_WITH_PERMISSION},
                  {provide: EnvironmentService, useValue: MOCK_ENVIRONMENT_SERVICE},
                  {provide: InvoiceService, useValue: MOCK_INVOICE_SERVICE}

      ],
      imports: [NavigationModule, FalconTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

  });


  it('should create', async () => {
    setup();
    expect(component).toBeTruthy();
  });

  describe('click edit status icon', () => {
    it('should do nothing if no to statuses.', async () => {
      TestBed.overrideProvider(InvoiceService, {useValue:MOCK_INVOICE_SERVICE_NO_STATUSES});
      setup();
      await fixture.whenStable();
      fixture.detectChanges();

      spyOn(invoiceLockServiceRef, 'createInvoiceLock');
      spyOn(utilServiceRef, 'openNewStatusEditModal');
      await component.clickStatusEditButton();
      expect(invoiceLockServiceRef.createInvoiceLock).not.toHaveBeenCalled();
      expect(utilServiceRef.openNewStatusEditModal).not.toHaveBeenCalled();
    });

    it('should release lock when modal is done', async () => {
      setup();
      await fixture.whenStable();
      fixture.detectChanges();

      spyOn(invoiceLockServiceRef, 'releaseInvoiceLock');
      await component.clickStatusEditButton();
      expect(invoiceLockServiceRef.releaseInvoiceLock).toHaveBeenCalled();

    });

    it('should not release lock when modal is done if not current user.', async () => {
      TestBed.overrideProvider(InvoiceLockService, {useValue:MOCK_INVOICE_LOCK_SERVICE_LOCKED_BY_DIFFERENT_USER});
      setup();
      await fixture.whenStable();
      fixture.detectChanges();

      spyOn(invoiceLockServiceRef, 'releaseInvoiceLock');
      await component.clickStatusEditButton();
      expect(invoiceLockServiceRef.releaseInvoiceLock).not.toHaveBeenCalled();

    });

    it('should refresh page', async () => {
      setup();
      await fixture.whenStable();
      fixture.detectChanges();

      spyOn(component.reloadPage, 'emit').and.stub();
      await component.clickStatusEditButton();
      expect(component.reloadPage.emit).toHaveBeenCalled();

    });
  });

  describe('edit status icon', () => {

    it('should be greyed out if status is not in master data.', async () => {
      TestBed.overrideProvider(UserService, {useValue:MOCK_USER_SERVICE_WITH_PERMISSION});
      TestBed.overrideProvider(InvoiceService, {useValue:MOCK_INVOICE_SERVICE_NO_STATUSES});
      setup();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.enableStatusEditButton).toBeTrue();
      expect(component.greyStatusEditButton).toBeTrue();
      const editStatusButton = fixture.debugElement.query(By.css('#edit-status-button'));
      expect(editStatusButton.classes['disable-span']).toBeTruthy();
      expect(editStatusButton).not.toBeNull();
    });

    it('should be visible with permissions, no lock and feature flag', async () => {
      TestBed.overrideProvider(UserService, {useValue:MOCK_USER_SERVICE_WITH_PERMISSION});
      setup();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.enableStatusEditButton).toBeTrue();
      expect(component.greyStatusEditButton).toBeFalse();
      const editStatusButton = fixture.debugElement.query(By.css('#edit-status-button'));
      expect(editStatusButton).not.toBeNull();
    });

    it('should not be visible without permissions, no lock and feature flag', async () => {
      TestBed.overrideProvider(UserService, {useValue:MOCK_USER_SERVICE_WITHOUT_PERMISSION});
      setup();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.enableStatusEditButton).toBeFalse();
      const editStatusButton = fixture.debugElement.query(By.css('#edit-status-button'));
      expect(editStatusButton).toBeNull();

    });

    it('should not be visible with permissions, a different user lock and feature flag', async () => {
      TestBed.overrideProvider(InvoiceLockService, {useValue:MOCK_INVOICE_LOCK_SERVICE_LOCKED_BY_DIFFERENT_USER});
      setup();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.enableStatusEditButton).toBeFalse();
      const editStatusButton = fixture.debugElement.query(By.css('#edit-status-button'));
      expect(editStatusButton).toBeNull();

    });

    it('should  be visible with permissions, the current user lock and feature flag', async () => {
      TestBed.overrideProvider(InvoiceLockService, {useValue:MOCK_INVOICE_LOCK_SERVICE_LOCKED_BY_CURRENT_USER});
      setup();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.enableStatusEditButton).toBeTrue();
      expect(component.greyStatusEditButton).toBeFalse();
      const editStatusButton = fixture.debugElement.query(By.css('#edit-status-button'));
      expect(editStatusButton).not.toBeNull();

    });

    it('should not be visible with permissions, no lock and feature flag turned off', async () => {
      TestBed.overrideProvider(EnvironmentService, {useValue:MOCK_ENVIRONMENT_SERVICE_FEATURE_TURNED_OFF});
      setup();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.enableStatusEditButton).toBeFalse();
      const editStatusButton = fixture.debugElement.query(By.css('#edit-status-button'));
      expect(editStatusButton).toBeNull();

    });
  });

  describe('help link', () => {
    it('should be visible when given a helpUrl', () => {
      setup();

      component.helpUrl = 'test';

      fixture.detectChanges();
      const link = fixture.debugElement.query(By.css('#help-link'));
      const button = fixture.debugElement.query(By.css('#help-btn'));
      expect(link).not.toBeNull();
      expect(button).toBeNull();
    });

    it('should override the button when both are given', () => {
      setup();

      component.helpUrl = 'test';
      component.forceHelpButton = true;
      fixture.detectChanges();
      const link = fixture.debugElement.query(By.css('#help-link'));
      const button = fixture.debugElement.query(By.css('#help-btn'));
      expect(link).not.toBeNull();
      expect(button).toBeNull();
    });

    it('should emit when clicked', () => {
      setup();

      const emitEventSpy = spyOn(component.helpRequested, 'emit');
      component.helpUrl = 'test';
      fixture.detectChanges();
      const link = fixture.debugElement.query(By.css('#help-link'));
      link.nativeElement.click();
      expect(emitEventSpy).toHaveBeenCalled();
    });
  });

  describe('help button', () => {
    it('should be visible when forceHelpButton = true and a help URL is not given', () => {
      setup();

      component.forceHelpButton = true;
      fixture.detectChanges();
      const link = fixture.debugElement.query(By.css('#help-link'));
      const button = fixture.debugElement.query(By.css('#help-btn'));
      expect(link).toBeNull();
      expect(button).not.toBeNull();
    });

    it('should emit when clicked', () => {
      setup();

      const emitEventSpy = spyOn(component.helpRequested, 'emit');
      component.forceHelpButton = true;
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('#help-btn'));
      button.triggerEventHandler('buttonClick', new Event('click'));
      expect(emitEventSpy).toHaveBeenCalled();
    });
  });
});

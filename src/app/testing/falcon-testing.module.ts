import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {InvoiceFormManager} from '../components/invoice-form/invoice-form-manager';
import {RealSubscriptionManager} from '../services/subscription-manager';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {WebServices} from '../services/web-services';
import {LoadingService} from '../services/loading-service';
import {InvoiceService} from '../services/invoice-service';
import {FakeAttachmentService} from '../services/attachment-service';
import {TemplateService} from '../services/template-service';
import {UtilService} from '../services/util-service';
import {OktaAuthModule, OktaAuthService} from '@okta/okta-angular';
import {ErrorService} from '../services/error-service';
import {FakeAuthService} from '../services/auth-service';
import {TimeService} from '../services/time-service';
import {FilterService} from '../services/filter-service';
import {MasterDataService} from '../services/master-data-service';

@NgModule({
  declarations: [],
  imports: [
    RouterTestingModule,
    HttpClientTestingModule,
    MatSnackBarModule,
    NoopAnimationsModule,
    MatDialogModule,
    OktaAuthModule,
  ],
  providers: [
    // PROVIDE EXTERNAL
    MatSnackBar,
    MatDialog,
    LoadingService,

    // PROVIDE FAKE
    FakeAttachmentService.PROVIDER,
    FakeAuthService.PROVIDER,

    // PROVIDE REAL
    TimeService,
    OktaAuthService,
    ErrorService,
    LoadingService,
    WebServices,
    ErrorService,
    InvoiceService,
    TemplateService,
    UtilService,
    FilterService,
    MasterDataService,
    InvoiceFormManager,
    RealSubscriptionManager.PROVIDER,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: []
})
export class FalconTestingModule {
}


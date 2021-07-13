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
import {FakeAttachmentService, RealAttachmentService} from '../services/attachment-service';
import {TemplateService} from '../services/template-service';
import {UtilService} from '../services/util-service';
import {OktaAuthModule, OktaAuthService} from '@okta/okta-angular';
import {ErrorService} from '../services/error-service';

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
    // PROVIDE FAKE
    FakeAttachmentService.PROVIDER,

    // PROVIDE REAL
    OktaAuthService,
    ErrorService,
    LoadingService,
    WebServices,
    MatSnackBar,
    MatDialog,
    LoadingService,
    MatSnackBar,
    InvoiceService,
    TemplateService,
    UtilService,
    InvoiceFormManager,
    RealSubscriptionManager.PROVIDER,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: []
})
export class FalconTestingModule {
}

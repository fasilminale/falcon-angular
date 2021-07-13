import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {WebServices} from './services/web-services';
import {HttpClientModule} from '@angular/common/http';
import {ButtonModule, ContainersModule, DataTableModule, InputsModule, NavigationModule, ProgressModule} from '@elm/elm-styleguide-ui';
import {InvoiceListPageComponent} from './pages/invoice-list-page/invoice-list-page.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {InvoiceCreatePageComponent} from './pages/invoice-create-page/invoice-create-page.component';
import {NgSelectModule} from '@ng-select/ng-select';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbDatepickerModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FalDateInputComponent} from './components/fal-date-input/fal-date-input.component';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {LoadingService} from './services/loading-service';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {FalRadioInputComponent} from './components/fal-radio-input/fal-radio-input.component';
import {InvoiceDetailPageComponent} from './pages/invoice-detail-page/invoice-detail-page.component';
import {FalFileInputComponent} from './components/fal-file-input/fal-file-input.component';
import {InvoiceFormComponent} from './components/invoice-form/invoice-form.component';
import {SearchComponent} from './components/search/search.component';
import {NgxCurrencyModule} from 'ngx-currency';
import {FalCurrencyInputComponent} from './components/fal-currency-input/fal-currency-input.component';
import {TemplateService} from './services/template-service';
import {UtilService} from './services/util-service';
import {TemplateInputModalComponent} from './components/template-input-modal/template-input-modal.component';
import {ManageMyTemplatesComponent} from './pages/manage-my-templates/manage-my-templates.component';
import {MatTableModule} from '@angular/material/table';
import {UploadFormComponent} from './components/upload-form/upload-form.component';
import {TimeService} from './services/time-service';
import {InvoiceService} from './services/invoice-service';
import {RealAttachmentService} from './services/attachment-service';
import {InputMaskModule} from 'racoon-mask-raw';
import {OktaCallbackComponent} from './components/okta-callback/okta-callback.component';
import {OKTA_CONFIG, OktaAuthGuard, OktaAuthService} from '@okta/okta-angular';
import {AuthService} from './services/auth-service';
import {ErrorService} from './services/error-service';
import {FalHttpInterceptor} from './services/fal-http-interceptor';
import {LoggedOutPageComponent} from './pages/logged-out-page/logged-out-page.component';
import {FalContainerComponent} from './components/fal-container/fal-container.component';
import {RealSubscriptionManager} from './services/subscription-manager';
import {InvoiceFormManager} from './components/invoice-form/invoice-form-manager';

const getOktaConfig = () => {
  const fullURL = window.location.origin;
  switch (fullURL) {
    case 'https://elm-dev.cardinalhealth.net': {
      return {
        clientId: '0oayu5waixuCGIDbo0h7',
        issuer: 'https://identity.dev.cardinalhealth.net/',
        redirectUri: 'https://elm-dev.cardinalhealth.net/falcon/login/callback',
        logoutUrl: 'https://elm-dev.cardinalhealth.net/falcon/logged-out'
      };
    }
    case 'https://elm-qa.cardinalhealth.net': {
      return {
        clientId: '0oazs9t13qwStnHh10h7',
        issuer: 'https://identity.stg.cardinalhealth.net/',
        redirectUri: 'https://elm-qa.cardinalhealth.net/falcon/login/callback',
        logoutUrl: 'https://elm-qa.cardinalhealth.net/falcon/logged-out'
      };
    }
    case 'https://elm.cardinalhealth.net': {
      return {
        clientId: '0oayu5waixuCGIDbo0h7',
        issuer: 'https://identity.cardinalhealth.net/',
        redirectUri: 'https://elm.cardinalhealth.net/falcon/login/callback',
        logoutUrl: 'https://elm.cardinalhealth.net/falcon/logged-out'
      };
    }
    default: {
      return {
        clientId: '0oayu5waixuCGIDbo0h7',
        issuer: 'https://identity.dev.cardinalhealth.net/',
        redirectUri: 'http://localhost:4200/login/callback',
        logoutUrl: 'http://localhost:4200/logged-out'
      };
    }
  }
};

const oktaConfigKeys = getOktaConfig();
const oktaConfig = {
  issuer: oktaConfigKeys.issuer,
  clientId: oktaConfigKeys.clientId,
  redirectUri: oktaConfigKeys.redirectUri,
  logoutUrl: oktaConfigKeys.logoutUrl,
};

@NgModule({
  declarations: [
    AppComponent,
    InvoiceListPageComponent,
    InvoiceCreatePageComponent,
    FalDateInputComponent,
    FalRadioInputComponent,
    InvoiceDetailPageComponent,
    FalFileInputComponent,
    InvoiceFormComponent,
    SearchComponent,
    FalCurrencyInputComponent,
    TemplateInputModalComponent,
    ManageMyTemplatesComponent,
    UploadFormComponent,
    FalContainerComponent,
    OktaCallbackComponent,
    LoggedOutPageComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // must be imported immediately after BrowserModule
    AppRoutingModule,
    HttpClientModule,
    NavigationModule,
    ButtonModule,
    ProgressModule,
    ContainersModule,
    DataTableModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSidenavModule,
    MatListModule,
    MatTableModule,
    NgbModule,
    NgxCurrencyModule,
    InputMaskModule,
    InputsModule
  ],
  providers: [
    WebServices,
    MatSnackBar,
    LoadingService,
    MatDialog,
    InvoiceService,
    RealAttachmentService.PROVIDER,
    TemplateService,
    UtilService,
    TimeService,
    ErrorService,
    OktaAuthGuard,
    OktaAuthService,
    AuthService,
    InvoiceFormManager,
    RealSubscriptionManager.PROVIDER,
    {provide: OKTA_CONFIG, useValue: oktaConfig},
    FalHttpInterceptor.PROVIDER,
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}

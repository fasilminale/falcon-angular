import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {WebServices} from './services/web-services';
import {HttpClientModule} from '@angular/common/http';
import {
  ButtonModule,
  ContainersModule,
  DataTableModule, FeedbackCollectorService,
  InputsModule,
  ModalsModule,
  NavigationModule,
  ProgressModule, ServicesModule
} from '@elm/elm-styleguide-ui';
import {InvoiceListPageComponent} from './pages/invoice-list-page/invoice-list-page.component';
import {InvoiceExtractionPageComponent} from './pages/invoice-extraction-page/invoice-extraction-page.component';
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
import {RealAuthService} from './services/auth-service';
import {ErrorService} from './services/error-service';
import {FalHttpInterceptor} from './services/fal-http-interceptor';
import {LoggedOutPageComponent} from './pages/logged-out-page/logged-out-page.component';
import {FalContainerComponent} from './components/fal-container/fal-container.component';
import {RealSubscriptionManager} from './services/subscription-manager';
import {InvoiceFormManager} from './components/invoice-form/invoice-form-manager';
import {InvoiceFilterModalComponent} from './components/invoice-filter-modal/invoice-filter-modal.component';
import {FilterService} from './services/filter-service';
import {ChipComponent} from './components/chip/chip.component';
import {MatChipsModule} from '@angular/material/chips';
import {MasterDataPageComponent} from './pages/master-data-page/master-data-page.component';
import {MasterDataService} from './services/master-data-service';
import {MasterDataUploadModalComponent} from './components/master-data-upload-modal/master-data-upload-modal.component';
import {EnvironmentService} from './services/environment-service/environment-service';
import {MasterDataUploadErrorModalComponent} from './components/master-data-upload-error-modal/master-data-upload-error-modal.component';
import {WindowService} from './services/window-service/window-service';
import {RoleGuard} from './components/role-guard/role-guard';
import { InvoiceEditPageComponent } from './pages/invoice-edit-page/invoice-edit-page.component';
import { MilestonePanelComponent } from './components/milestone-panel/milestone-panel.component';
import { InvoiceOverviewComponent } from './pages/invoice-edit-page/invoice-overview/invoice-overview.component';
import { TripInformationComponent } from './pages/invoice-edit-page/trip-information/trip-information.component';
import { CostBreakdownComponent } from './pages/invoice-edit-page/cost-breakdown/cost-breakdown.component';
import { AllocationComponent } from './pages/invoice-edit-page/allocation/allocation.component';
import { FalAddressComponent } from './components/fal-address/fal-address.component';
import { FreightOrderDetailsComponent } from './pages/freight-order-details/freight-order-details.component';
import { InvoiceAmountComponent } from './pages/invoice-edit-page/invoice-amount/invoice-amount.component';
import { InvoiceAllocationComponent } from './pages/invoice-edit-page/invoice-allocation/invoice-allocation.component';
import {BuildInfoService} from './services/build-info.service';

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
        clientId: '0oaksn42jfaPtbrWa1t7',
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
    InvoiceExtractionPageComponent,
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
    LoggedOutPageComponent,
    InvoiceFilterModalComponent,
    ChipComponent,
    MasterDataPageComponent,
    MasterDataUploadModalComponent,
    MasterDataUploadErrorModalComponent,
    InvoiceEditPageComponent,
    MilestonePanelComponent,
    InvoiceOverviewComponent,
    TripInformationComponent,
    CostBreakdownComponent,
    AllocationComponent,
    FalAddressComponent,
    FreightOrderDetailsComponent,
    InvoiceAmountComponent,
    InvoiceAllocationComponent
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
    MatChipsModule,
    NgbModule,
    NgxCurrencyModule,
    InputMaskModule,
    InputsModule,
    ModalsModule,
    ServicesModule,
  ],
  providers: [
    WebServices,
    MatSnackBar,
    LoadingService,
    MatDialog,
    InvoiceService,
    RealAttachmentService.PROVIDER,
    TemplateService,
    MasterDataService,
    UtilService,
    TimeService,
    ErrorService,
    OktaAuthGuard,
    OktaAuthService,
    RealAuthService.PROVIDER,
    InvoiceFormManager,
    FilterService,
    EnvironmentService,
    WindowService,
    RoleGuard,
    RealSubscriptionManager.PROVIDER,
    {provide: OKTA_CONFIG, useValue: oktaConfig},
    FalHttpInterceptor.PROVIDER,
    FeedbackCollectorService,
    BuildInfoService,
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}

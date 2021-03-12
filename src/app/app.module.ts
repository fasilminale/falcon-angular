import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HealthCheckComponent} from './components/health-check/health-check.component';
import {WebServices} from './services/web-services';
import {HttpClientModule} from '@angular/common/http';
import {ButtonModule, ContainersModule, DataTableModule, NavigationModule, ProgressModule} from '@elm/elm-styleguide-ui';
import {InvoiceListPageComponent} from './pages/invoice-list-page/invoice-list-page.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {InvoiceCreatePageComponent} from './pages/invoice-create-page/invoice-create-page.component';
import {NgSelectModule} from '@ng-select/ng-select';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbDatepickerModule} from '@ng-bootstrap/ng-bootstrap';
import {FalDateInputComponent} from './components/fal-date-input/fal-date-input.component';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {LoadingService} from './services/loading-service';
import {FalConfirmationModalComponent} from './components/fal-confirmation-modal/fal-confirmation-modal.component';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    HealthCheckComponent,
    InvoiceListPageComponent,
    InvoiceCreatePageComponent,
    FalDateInputComponent,
    FalConfirmationModalComponent
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
    MatDialogModule
  ],
  providers: [
    WebServices,
    MatSnackBar,
    LoadingService,
    MatDialog
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}

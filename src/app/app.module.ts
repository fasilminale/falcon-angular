import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {WebServices} from './services/web-services';
import {HttpClientModule} from '@angular/common/http';
import {ButtonModule, ContainersModule, DataTableModule, NavigationModule, ProgressModule} from '@elm/elm-styleguide-ui';
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
import {MatCurrencyFormatModule} from 'mat-currency-format';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {FalRadioInputComponent} from './components/fal-radio-input/fal-radio-input.component';
import {InvoiceDetailPageComponent} from './pages/invoice-detail-page/invoice-detail-page.component';
import { FalFileInputComponent } from './components/fal-file-input/fal-file-input.component';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';

@NgModule({
  declarations: [
    AppComponent,
    InvoiceListPageComponent,
    InvoiceCreatePageComponent,
    FalDateInputComponent,
    FalRadioInputComponent,
    InvoiceDetailPageComponent,
    FalFileInputComponent,
    InvoiceFormComponent
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
    MatCurrencyFormatModule,
    MatSidenavModule,
    MatListModule,
    NgbModule
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

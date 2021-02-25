import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HealthCheckComponent } from './health-check/health-check.component';
import {WebServices} from './services/web-services';
import {HttpClientModule} from '@angular/common/http';
import {ButtonModule, NavigationModule, ProgressModule} from '@elm/elm-styleguide-ui';
import { InvoiceListComponent } from './pages/invoice-list/invoice-list.component';
import { InvoiceListPageComponent } from './pages/invoice-list-page/invoice-list-page.component';

@NgModule({
  declarations: [
    AppComponent,
    HealthCheckComponent,
    InvoiceListComponent,
    InvoiceListPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NavigationModule,
    ButtonModule,
    ProgressModule
  ],
  providers: [WebServices],
  bootstrap: [AppComponent]
})
export class AppModule { }

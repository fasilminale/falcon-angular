import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HealthCheckComponent} from './health-check/health-check.component';
import {WebServices} from './services/web-services';
import {HttpClientModule} from '@angular/common/http';
import {ButtonModule, ContainersModule, DataTableModule, NavigationModule, ProgressModule} from '@elm/elm-styleguide-ui';
import {InvoiceListPageComponent} from './pages/invoice-list-page/invoice-list-page.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    HealthCheckComponent,
    InvoiceListPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NavigationModule,
    ButtonModule,
    ProgressModule,
    ContainersModule,
    DataTableModule,
    BrowserAnimationsModule
  ],
  providers: [WebServices],
  bootstrap: [AppComponent]
})
export class AppModule {
}

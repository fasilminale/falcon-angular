import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {InvoiceListPageComponent} from './pages/invoice-list-page/invoice-list-page.component';
import {InvoiceCreatePageComponent} from './pages/invoice-create-page/invoice-create-page.component';
import {InvoiceDetailPageComponent} from './pages/invoice-detail-page/invoice-detail-page.component';
import { ManageMyTemplatesComponent } from './pages/manage-my-templates/manage-my-templates.component';
import {OktaAuthGuard} from '@okta/okta-angular';
import {OktaCallbackComponent} from './components/okta-callback/okta-callback.component';

const routes: Routes = [
  {path: 'invoices', component: InvoiceListPageComponent, canActivate: [OktaAuthGuard]},
  {path: 'invoice/create', component: InvoiceCreatePageComponent, canActivate: [OktaAuthGuard]},
  {path: 'invoice/:falconInvoiceNumber', component: InvoiceDetailPageComponent, canActivate: [OktaAuthGuard]},
  {path: 'templates', component: ManageMyTemplatesComponent, canActivate: [OktaAuthGuard]},
  {path: 'login/callback', component: OktaCallbackComponent},
  {path: '', redirectTo: '/invoices', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

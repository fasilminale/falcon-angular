import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {InvoiceListPageComponent} from './pages/invoice-list-page/invoice-list-page.component';
import {InvoiceCreatePageComponent} from './pages/invoice-create-page/invoice-create-page.component';
import {InvoiceDetailPageComponent} from './pages/invoice-detail-page/invoice-detail-page.component';
import { ManageMyTemplatesComponent } from './pages/manage-my-templates/manage-my-templates.component';

const routes: Routes = [
  {path: '', redirectTo: '/invoices', pathMatch: 'full'},
  {path: 'invoices', component: InvoiceListPageComponent},
  {path: 'invoice/create', component: InvoiceCreatePageComponent},
  {path: 'invoice/:falconInvoiceNumber', component: InvoiceDetailPageComponent},
  {path: 'templates', component: ManageMyTemplatesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

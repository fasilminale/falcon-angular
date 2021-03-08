import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {InvoiceListPageComponent} from './pages/invoice-list-page/invoice-list-page.component';
import {InvoiceCreatePageComponent} from './pages/invoice-create-page/invoice-create-page.component';

const routes: Routes = [
  {path: '', redirectTo: '/invoices', pathMatch: 'full'},
  {path: 'invoices', component: InvoiceListPageComponent},
  {path: 'invoice/create', component: InvoiceCreatePageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

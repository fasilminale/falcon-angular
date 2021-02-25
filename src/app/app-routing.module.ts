import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {InvoiceListPageComponent} from './pages/invoice-list-page/invoice-list-page.component';

const routes: Routes = [
  {path: '', redirectTo: '/invoices', pathMatch: 'full'},
  {path: 'invoices', component: InvoiceListPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

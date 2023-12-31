import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {InvoiceListPageComponent} from './pages/invoice-list-page/invoice-list-page.component';
import {InvoiceExtractionPageComponent} from './pages/invoice-extraction-page/invoice-extraction-page.component';
import {InvoiceCreatePageComponent} from './pages/invoice-create-page/invoice-create-page.component';
import {InvoiceDetailPageComponent} from './pages/invoice-detail-page/invoice-detail-page.component';
import {ManageMyTemplatesComponent} from './pages/manage-my-templates/manage-my-templates.component';
import {OktaAuthGuard} from '@okta/okta-angular';
import {OktaCallbackComponent} from './components/okta-callback/okta-callback.component';
import {LoggedOutPageComponent} from './pages/logged-out-page/logged-out-page.component';
import {MasterDataPageComponent} from './pages/master-data-page/master-data-page.component';
import {RoleGuard} from './components/role-guard/role-guard';
import {InvoiceEditPageComponent} from './pages/invoice-edit-page/invoice-edit-page.component';
import {NewUserLogoutPageComponent} from './pages/new-user-logout-page/new-user-logout-page.component';
import {DirtyInvoiceEditFormGuard} from './services/dirty-edit-invoice-form-deactivate.guard';
import {DirtyInvoiceCreateFormGuard} from './services/dirty-create-invoice-form-deactivate.guard';
import {DirtyAutoInvoiceEditFormGuard} from './services/dirty-edit-auto-invoice-form-deactivate.guard';
import {InvoiceLockListPageComponent} from './pages/invoice-lock-list-page/invoice-lock-list-page.component';
import {ElmUamPermission} from './utils/elm-uam-permission';

const routes: Routes = [
  {path: 'master-data', component: MasterDataPageComponent, canActivate: [OktaAuthGuard]},
  {path: 'invoices', component: InvoiceListPageComponent, canActivate: [OktaAuthGuard]},
  {path: 'invoice-extraction', component: InvoiceExtractionPageComponent, canActivate: [OktaAuthGuard]},
  {path: 'manage-invoice-locks', component: InvoiceLockListPageComponent, canActivate: [OktaAuthGuard]},
  {
    path: 'invoice/create',
    component: InvoiceCreatePageComponent,
    canActivate: [OktaAuthGuard, RoleGuard],
    canDeactivate: [DirtyInvoiceCreateFormGuard],
    data: {permissions: [ElmUamPermission.ALLOW_INVOICE_WRITE]}
  },
  {
    path: 'invoice/:falconInvoiceNumber/:entryType',
    component: InvoiceEditPageComponent,
    canDeactivate: [DirtyAutoInvoiceEditFormGuard],
    canActivate: [OktaAuthGuard]
  },
  {
    path: 'invoice/:falconInvoiceNumber',
    component: InvoiceDetailPageComponent,
    canDeactivate: [DirtyInvoiceEditFormGuard],
    canActivate: [OktaAuthGuard]
  },
  {
    path: 'templates', component: ManageMyTemplatesComponent, canActivate: [OktaAuthGuard, RoleGuard],
    data: {permissions: [ElmUamPermission.ALLOW_INVOICE_WRITE]}
  },
  {path: 'login/callback', component: OktaCallbackComponent},
  {path: 'logged-out', component: LoggedOutPageComponent},
  {path: 'newUserForbidden', component: NewUserLogoutPageComponent},
  {path: '', redirectTo: '/invoices', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

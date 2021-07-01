import {NgModule} from '@angular/core';
import {InvoiceFormManager} from '../components/invoice-form/invoice-form-manager';
import {SubscriptionManager} from '../services/subscription-manager';

@NgModule({
  declarations: [],
  imports: [],
  providers: [
    InvoiceFormManager,
    SubscriptionManager,
  ],
  bootstrap: []
})
export class FalconTestingModule {
}

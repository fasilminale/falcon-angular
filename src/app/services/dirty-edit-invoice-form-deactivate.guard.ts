import {CanDeactivate} from '@angular/router';
import {Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';
import {InvoiceEditPageComponent} from '../pages/invoice-edit-page/invoice-edit-page.component';
import {InvoiceDetailPageComponent} from '../pages/invoice-detail-page/invoice-detail-page.component';

@Injectable({
  providedIn: 'root'
})
export class DirtyInvoiceEditFormGuard implements CanDeactivate<InvoiceDetailPageComponent> {
  canDeactivate(component: InvoiceDetailPageComponent): Observable<boolean> {
    const formComponent = component.invoiceForm;
    if (formComponent?.isFormPristine) {
      return of(true);
    }
    else if (formComponent) {
      return formComponent.askForCancelConfirmation();
    }
    else {
      return of(true);
    }
  }
}

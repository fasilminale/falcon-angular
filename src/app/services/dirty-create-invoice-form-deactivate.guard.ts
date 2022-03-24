import {CanDeactivate} from '@angular/router';
import {Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';
import {InvoiceCreatePageComponent} from '../pages/invoice-create-page/invoice-create-page.component';

@Injectable({
  providedIn: 'root'
})
export class DirtyInvoiceCreateFormGuard implements CanDeactivate<InvoiceCreatePageComponent> {
  canDeactivate(component: InvoiceCreatePageComponent): Observable<boolean> {
    const formComponent = component.formComponent;
    if (formComponent.isFormPristine) {
      return of(true);
    }
    else {
      return formComponent.askForCancelConfirmation();
    }
  }
}

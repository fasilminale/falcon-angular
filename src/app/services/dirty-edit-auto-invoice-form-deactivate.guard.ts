import {ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot} from '@angular/router';
import {Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';
import {InvoiceEditPageComponent} from '../pages/invoice-edit-page/invoice-edit-page.component';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DirtyAutoInvoiceEditFormGuard implements CanDeactivate<InvoiceEditPageComponent> {
  canDeactivate(component: InvoiceEditPageComponent,
                currentRoute: ActivatedRouteSnapshot,
                currentState: RouterStateSnapshot,
                nextState: RouterStateSnapshot): Observable<boolean> {
    if (!component.isEditMode$.value) {
      return of(true);
    }
    else if (component.invoiceFormGroup && !component.invoiceFormGroup?.pristine) {
      return component.askForCancelConfirmation().pipe(
        // This fixes an issue with the Back button which has existed for years but has
        // finally been fixed in Angular 13.
        // See: https://stackoverflow.com/questions/47661945/angular-4-candeactivate-fails-if-back-button-is-hit-twice-in-a-row
        // When we upgrade to Angular 13, instead of this tap operator, use:
        // router.canceledNavigationResolution = 'computed' in app.component.ts.
        tap(navigate => {
          if (!navigate) {
            history.pushState('', '', nextState.url);
          }
        })
      );
    }
    else {
      return of(true);
    }
  }
}

import {Injectable} from '@angular/core';
import {HttpHandler, HttpInterceptor, HttpRequest, HttpEvent, HTTP_INTERCEPTORS} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {ErrorService} from './error-service';
import {LoadingService} from './loading-service';
import {OktaAuthService} from '@okta/okta-angular';

@Injectable()
export class FalHttpInterceptor implements HttpInterceptor {

  static readonly PROVIDER = {provide: HTTP_INTERCEPTORS, useClass: FalHttpInterceptor, multi: true};

  constructor(private errorService: ErrorService,
              private oktaAuth: OktaAuthService,
              private loadingService: LoadingService) {
  }

  public intercept(request: HttpRequest<any>,
                   next: HttpHandler): Observable<HttpEvent<any>> {
    const modifiedReq = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${this.oktaAuth.getAccessToken()}`),
    });
    return next.handle(modifiedReq).pipe(
      catchError(errResponse => {
        // tslint:disable-next-line:triple-equals
        if (errResponse.status != 422) {
          console.log(errResponse);
          const status = errResponse.status;
          const message = this.extractMessage(errResponse);
          const errorText = `status: ${status}, message: ${message}`;
          this.errorService.addError({status, message});
          this.loadingService.hideLoading();
          return throwError(errorText);
        }
        return throwError(errResponse);
      }));
  }

  private extractMessage(errResponse: any): string {
    return errResponse.error?.error?.message // falcon error
      ?? errResponse.error?.message // generic/okta error
      ?? errResponse.message // js generated message, should always exist
      ?? 'N/A'; // failsafe, instead  of null
  }

}

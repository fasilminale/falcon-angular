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

  intercept(request: HttpRequest<any>,
    next: HttpHandler): Observable<HttpEvent<any>> {
    const modifiedReq = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${this.oktaAuth.getAccessToken()}`),
    });

    return next.handle(modifiedReq).pipe(
      catchError(err => {
        if (err.status != 422) {
          const errorMessage = `status: ${err.status}, message: ${err.error.message}`;
          this.errorService.addError(err);
          this.loadingService.hideLoading();
          return throwError(errorMessage);
        }
        return throwError(err);
      }));
  }
}

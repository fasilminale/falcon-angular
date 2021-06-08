import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';


@Injectable()
export class ErrorService {
  private errors = new Subject<Error>();

  constructor() {
  }

  public addError(error: Error): void {
    return this.errors.next(error);
  }

  public getErrors(): Observable<Error> {
    return this.errors.asObservable();
  }
}

export interface Error {
  status: string;
  error: { message: string };
}

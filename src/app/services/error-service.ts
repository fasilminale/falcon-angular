import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';


@Injectable()
export class ErrorService {
  private errors = new Subject<any>();
  constructor() {}

  public addError = (error: any): void => {
    return this.errors.next(error);
  }
  public getErrors = () => {
    return this.errors.asObservable();
  }
}

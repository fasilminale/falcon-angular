import {Observable, Subject} from 'rxjs';

export class SubjectValue<T> {

  private _value: T;
  private _subject = new Subject<T>();

  constructor(initialValue: T) {
    this._value = initialValue;
    this.value = initialValue;
  }

  set value(newValue: T) {
    this._value = newValue;
    this._subject.next(newValue);
  }

  get value(): T {
    return this._value;
  }

  asSubject(): Subject<T> {
    return this._subject;
  }

  asObservable(): Observable<T> {
    return this.asSubject().asObservable();
  }

}

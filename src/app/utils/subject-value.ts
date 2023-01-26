import {BehaviorSubject, Observable} from 'rxjs';

export class SubjectValue<T> {

  private _value: T;
  private readonly _subject: BehaviorSubject<T>;

  constructor(initialValue: T) {
    this._subject = new BehaviorSubject(initialValue);
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

  asSubject(): BehaviorSubject<T> {
    return this._subject;
  }

  asObservable(): Observable<T> {
    return this.asSubject().asObservable();
  }

}

import {ControlValueAccessor} from '@angular/forms';

export class FalControlValueAccessorComponent<T> implements ControlValueAccessor {


  /** Hidden value, do access directly */
    // tslint:disable-next-line:variable-name
  private _value?: T;

  constructor() {
  }

  get value(): T | undefined {
    return this._value;
  }

  set value(t: T | undefined) {
    this._value = t;
    if (this.onChange) {
      this.onChange(this.value);
    }
  }

  onChange(t?: T): void {
    // do nothing by default
    // see registerOnChange
  }

  registerOnChange(fn: (t?: T) => void): void {
    this.onChange = fn;
  }

  onTouched(): void {
    // do nothing by default
    // see registerOnTouched
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(obj: any): void {
    this.value = obj as T;
  }

}

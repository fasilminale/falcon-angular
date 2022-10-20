import {ControlValueAccessor} from '@angular/forms';

export class FalControlValueAccessorComponent<T> implements ControlValueAccessor {


  /** Hidden value, do access directly */
    // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
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
    this._value = obj as T;
  }

}

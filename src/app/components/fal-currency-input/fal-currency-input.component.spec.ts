import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { FalCurrencyInputComponent } from './fal-currency-input.component';
import {FalRadioOrientation} from '../fal-radio-input/fal-radio-input.component';
import {By} from '@angular/platform-browser';
import {NgxCurrencyModule} from 'ngx-currency';

describe('FalCurrencyInputComponent', () => {
  let component: FalCurrencyInputComponent;
  let fixture: ComponentFixture<FalCurrencyInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FalCurrencyInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FalCurrencyInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to initialValue', () => {
    expect(component.value).toEqual('0.00');
  });
});

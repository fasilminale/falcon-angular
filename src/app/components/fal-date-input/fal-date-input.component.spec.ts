import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FalDateInputComponent} from './fal-date-input.component';
import {NgbDatepickerModule} from '@ng-bootstrap/ng-bootstrap';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('FalDateInputComponent', () => {
  let component: FalDateInputComponent;
  let fixture: ComponentFixture<FalDateInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgbDatepickerModule, NoopAnimationsModule],
      declarations: [FalDateInputComponent],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FalDateInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to empty value', () => {
    expect(component.value).toEqual('');
  });

  it('should trigger onTouched when value set', () => {
    spyOn(component, 'onTouched').and.callThrough();
    component.value = '2021-03-15';
    expect(component.onTouched).toHaveBeenCalled();
  });

  it('should trigger onChange when value set', () => {
    spyOn(component, 'onChange').and.callThrough();
    const newValue = '2021-03-15';
    component.value = newValue;
    expect(component.onChange).toHaveBeenCalledWith(newValue);
  });

  it('should change value when writeValue is called', () => {
    const newValue = '2021-03-15';
    component.writeValue(newValue);
    expect(component.value).toEqual(newValue);
  });

  it('should call registered onTouched function', () => {
    let customFunctionCalled = false;
    component.registerOnTouched(() => {
      customFunctionCalled = true;
    });
    component.value = '2021-03-15';
    expect(customFunctionCalled).toBeTrue();
  });

  it('should call registered onChange function', () => {
    let customFunctionCalled = false;
    component.registerOnChange((_: string) => {
      customFunctionCalled = true;
    });
    component.value = '2021-03-15';
    expect(customFunctionCalled).toBeTrue();
  });

});

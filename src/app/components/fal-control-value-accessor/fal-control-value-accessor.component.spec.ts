import {FalControlValueAccessorComponent} from './fal-control-value-accessor.component';
import {TestBed} from '@angular/core/testing';

describe('FalControlValueAccessor', () => {
  let component: FalControlValueAccessorComponent<string>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      declarations: [],
      providers: [
        {
          provide: FalControlValueAccessorComponent,
          useValue: new FalControlValueAccessorComponent()
        }
      ],
      schemas: []
    })
      .compileComponents();
  });

  beforeEach(() => {
    component = TestBed.inject(FalControlValueAccessorComponent);
    component.value = 'default';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger onChange when value set', () => {
    spyOn(component, 'onChange').and.stub();
    const newValue = 'new value';
    component.value = newValue;
    expect(component.onChange).toHaveBeenCalledWith(newValue);
  });

  it('should change value when writeValue is called', () => {
    const valueSpy = spyOnProperty(component, 'value', 'set').and.stub();
    const newValue = 'new value';
    component.writeValue(newValue);
    expect(valueSpy).toHaveBeenCalledWith(newValue);
  });

  it('should call registered onChange function', () => {
    let customFunctionCalled = false;
    component.registerOnChange((_?: string) => {
      customFunctionCalled = true;
    });
    component.value = 'new value';
    expect(customFunctionCalled).toBeTrue();
  });

});

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FalRadioInputComponent, FalRadioOrientation} from './fal-radio-input.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';

describe('FalRadioInputComponent', () => {
  let component: FalRadioInputComponent;
  let fixture: ComponentFixture<FalRadioInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [FalRadioInputComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(FalRadioInputComponent);
    component = fixture.componentInstance;
    component.initialValue = 'default';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to initialValue', () => {
    expect(component.value).toEqual('default');
  });

  it('should consider string a value', () => {
    const input = 'some value';
    const output = component.getValue(input);
    expect(output).toEqual(input);
  });

  it('should consider value property on object a value', () => {
    const expected = 'some value';
    const input = {display: 'not expected', value: expected};
    const output = component.getValue(input);
    expect(output).toEqual(expected);
  });

  it('should consider string a display', () => {
    const input = 'some value';
    const output = component.getDisplay(input);
    expect(output).toEqual(input);
  });

  it('should consider display property on object a display', () => {
    const expected = 'some value';
    const input = {display: expected, value: 'not expected'};
    const output = component.getDisplay(input);
    expect(output).toEqual(expected);
  });

  it('should consider value property, on object without display property, a display', () => {
    const expected = 'some value';
    const input = {value: expected};
    const output = component.getDisplay(input);
    expect(output).toEqual(expected);
  });

  it('should be horizontal when orientation is HORIZONTAL', () => {
    component.orientation = FalRadioOrientation.HORIZONTAL;
    expect(component.isHorizontal()).toBeTrue();
  });

  it('should not be horizontal when orientation is VERTICAL', () => {
    component.orientation = FalRadioOrientation.VERTICAL;
    expect(component.isHorizontal()).toBeFalse();
  });
});

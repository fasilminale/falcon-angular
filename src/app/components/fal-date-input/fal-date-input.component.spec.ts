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
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
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

  it('should format the input value', () => {
    let target = {value: '11'};
    component.formatText(target);
    expect(target.value).toEqual('11-');

    target = {value: '11-11'};
    component.formatText(target);
    expect(target.value).toEqual('11-11-');
  });
});

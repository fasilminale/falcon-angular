import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FalDateInputComponent } from './fal-date-input.component';

describe('FalDateInputComponent', () => {
  let component: FalDateInputComponent;
  let fixture: ComponentFixture<FalDateInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FalDateInputComponent ]
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
});

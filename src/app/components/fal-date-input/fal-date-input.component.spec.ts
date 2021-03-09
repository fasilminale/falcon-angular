import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FalDateInputComponent} from './fal-date-input.component';
import {NgbDatepickerModule} from '@ng-bootstrap/ng-bootstrap';

describe('FalDateInputComponent', () => {
  let component: FalDateInputComponent;
  let fixture: ComponentFixture<FalDateInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgbDatepickerModule],
      declarations: [FalDateInputComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FalDateInputComponent);
    component = fixture.componentInstance;
    component.id = 'test-id';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

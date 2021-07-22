import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FalDateInputComponent} from './fal-date-input.component';
import {NgbDatepickerModule} from '@ng-bootstrap/ng-bootstrap';
import {FalconTestingModule} from '../../testing/falcon-testing.module';

describe('FalDateInputComponent', () => {
  let component: FalDateInputComponent;
  let fixture: ComponentFixture<FalDateInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FalconTestingModule,
        NgbDatepickerModule
      ],
      declarations: [FalDateInputComponent],
    }).compileComponents();
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
});

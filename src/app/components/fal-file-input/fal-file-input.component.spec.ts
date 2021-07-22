import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FalFileInputComponent} from './fal-file-input.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';

describe('FalFileInputComponent', () => {
  let component: FalFileInputComponent;
  let fixture: ComponentFixture<FalFileInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [FalFileInputComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(FalFileInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset value', () => {
    component.reset();
    expect(component.value).toBeUndefined();
  });

});

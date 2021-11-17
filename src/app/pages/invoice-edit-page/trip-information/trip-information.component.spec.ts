import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripInformationComponent } from './trip-information.component';
import {FalconTestingModule} from '../../../testing/falcon-testing.module';

describe('TripInformationComponent', () => {
  let component: TripInformationComponent;
  let fixture: ComponentFixture<TripInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [ TripInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TripInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MilestonePanelComponent} from './milestone-panel.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {TimeService} from '../../services/time-service';

describe('MilestonePanelComponent', () => {
  let component: MilestonePanelComponent;
  let fixture: ComponentFixture<MilestonePanelComponent>;

  let timeService: TimeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [MilestonePanelComponent]
    }).compileComponents();

    // Mock Time Service
    timeService = TestBed.inject(TimeService);
    spyOn(timeService, 'formatTimestamp').and.returnValue(undefined);

    // Create Component
    fixture = TestBed.createComponent(MilestonePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format timestamp', () => {
    component.formatTimestamp('some date value');
    expect(timeService.formatTimestamp).toHaveBeenCalledWith(
      'some date value', 'MM/DD/YY HH:mm z'
    );
  });

});

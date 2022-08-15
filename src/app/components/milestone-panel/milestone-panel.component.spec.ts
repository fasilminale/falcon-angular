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
    spyOn(timeService, 'compareTimestamps').and.callThrough();

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

  it('should sort milestones', () => {
    const ms1 = {
      timestamp: '2022-08-08T13:05:48.874Z',
      type: {
        key: 'TYPE1',
        label: 'Type 1'
      },
      user: 'Test User'
    };
    const ms2 = {
      timestamp: '2022-08-15T18:20:29.063Z',
      type: {
        key: 'TYPE2',
        label: 'Type 2'
      },
      user: 'Test User'
    };
    component.milestones = [ms1, ms2];
    expect(component.milestones).toEqual([ms2, ms1]);
  });

});

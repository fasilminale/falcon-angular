import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestonePanelComponent } from './milestone-panel.component';
import {FalconTestingModule} from '../../testing/falcon-testing.module';

describe('MilestonePanelComponent', () => {
  let component: MilestonePanelComponent;
  let fixture: ComponentFixture<MilestonePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [ MilestonePanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MilestonePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

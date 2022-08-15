import {Component, Input} from '@angular/core';
import {Milestone} from '../../models/milestone/milestone-model';
import {UtilService} from '../../services/util-service';
import {TimeService} from '../../services/time-service';

@Component({
  selector: 'app-milestone-panel',
  templateUrl: './milestone-panel.component.html',
  styleUrls: ['./milestone-panel.component.scss']
})
export class MilestonePanelComponent {

  private _milestones: Array<Milestone> = [];

  constructor(public util: UtilService,
              private timeService: TimeService) {
  }

  formatTimestamp(value: string): string | undefined {
    return this.timeService.formatTimestamp(value, 'MM/DD/YY HH:mm z');
  }

  @Input() set milestones(newMilestones: Array<Milestone>) {
    this._milestones = newMilestones;
    this._milestones.sort((a: Milestone, b: Milestone) => {
      return -this.timeService.compareTimestamps(a.timestamp, b.timestamp);
    });
  }

  get milestones(): Array<Milestone> {
    return this._milestones;
  }

}

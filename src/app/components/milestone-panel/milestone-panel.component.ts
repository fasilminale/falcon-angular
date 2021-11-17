import {Component, Input, OnInit} from '@angular/core';
import {Milestone} from '../../models/milestone/milestone-model';
import {UtilService} from '../../services/util-service';
import {TimeService} from '../../services/time-service';

@Component({
  selector: 'app-milestone-panel',
  templateUrl: './milestone-panel.component.html',
  styleUrls: ['./milestone-panel.component.scss']
})
export class MilestonePanelComponent implements OnInit {

  @Input() public milestones: Array<Milestone> = [];

  constructor(public util: UtilService,
              private timeService: TimeService) {
  }

  ngOnInit(): void {
  }

  public formatTimestamp(value: string): string | undefined {
    return this.timeService.formatTimestamp(value, 'MM/DD/YY HH:mm z');
  }

}

import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-info-icon-tooltip',
  templateUrl: './info-icon-tooltip.component.html',
  styleUrls: ['./info-icon-tooltip.component.scss']
})
export class InfoIconTooltipComponent {
  @Input() tooltipMessage = '';
  @Input() messagePosition: 'left' | 'right' | 'above' | 'below' | 'before' | 'after' = 'above';
  @Input() fontSize = '15px';
}

import {Component, OnInit} from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'fal-container',
  templateUrl: './fal-container.component.html',
  styleUrls: ['./fal-container.component.scss']
})
export class FalContainerComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }

  getIcon(): string {
    return 'info';
  }

}
import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormControl} from '@angular/forms';

@Component({
  selector: 'app-fal-accessorial-detail',
  template: `<elm-card class="col-12 accessorial-details-section" *ngIf="lineItem.value.expanded">
    <div class="accessorial-details">
      <div class="col-12">
        <div class="row accessorial-details-row">
          <div class="col-1 accessorial-detail">
            <span class="label-text">Entry Source</span>
            <span class="value-text">{{lineItem.value.entrySource}}</span>
          </div>
        </div>
        <div class="row accessorial-details-row">
          <div class="col-1 accessorial-detail ">
            <span class="label-text">Request Status</span>
            <span class="value-text">{{lineItem.value.requestStatus}}</span>
          </div>

          <div class="col-1 accessorial-detail ">
            <span class="label-text">Created By</span>
            <span class="value-text">{{lineItem.value.createdBy}}</span>
          </div>
          <div class="col-1 accessorial-detail">
            <span class="label-text">Created Date</span>
            <span class="value-text">{{lineItem.value.createdDate | date: dateFormat}}</span>
          </div>
          <div class="col-9 accessorial-detail">
            <span class="label-text">Carrier Comment</span>
            <span class="value-text">{{lineItem.value.carrierComment}}</span>
          </div>
        </div>
        <div class="row accessorial-details-row-end">
          <div class="col-1 accessorial-detail">
            <span class="label-text">Rate Response</span>
            <span class="value-text">{{lineItem.value.rateResponse}}</span>
          </div>
          <div class="col-1 accessorial-detail">
            <span class="label-text">Closed By</span>
            <span class="value-text">{{lineItem.value.closedBy}}</span>
          </div>
          <div class="col-1 accessorial-detail">
            <span class="label-text">Closed Date</span>
            <span class="value-text">{{lineItem.value.closedDate | date: dateFormat}}</span>
          </div>
          <div class="col-9 accessorial-detail">
            <span class="label-text">Response Comment</span>
            <span class="value-text">{{lineItem.value.responseComment}}</span>
          </div>
        </div>
      </div>
    </div>
  </elm-card>
  `,
  styleUrls: ['./fal-accessorial-detail.component.scss']
})
export class FalAccessorialDetailComponent implements OnInit {

  public readonly dateFormat = 'MM-dd-YYYY';
  @Input() lineItem: AbstractControl = new FormControl({});

  constructor() { }

  ngOnInit(): void {
  }

}

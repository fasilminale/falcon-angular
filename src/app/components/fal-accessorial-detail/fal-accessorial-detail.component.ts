import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, UntypedFormControl} from '@angular/forms';

@Component({
  selector: 'app-fal-accessorial-detail',
  template: `
    <elm-card class="accessorial-details-section" *ngIf="lineItem.value.expanded">
      <div class="accessorial-details">

        <!-- ROW 1 -->
        <div class="row accessorial-details-row">
          <div class="col-xxl-2 col-md-3 col-sm-3 col-xs-4 accessorial-detail">
            <span class="label-text">Entry Source</span>
            <span class="value-text">{{lineItem.value.entrySource}}</span>
          </div>
          <div class="col-xxl-1 col-md-2 col-sm-3 col-xs-4 accessorial-detail">
            <span class="label-text">Request Status</span>
            <span class="value-text">{{lineItem.value.requestStatus}}</span>
          </div>
          <div class="col-xxl-9 col-md-7 col-sm-3 col-xs-4 accessorial-detail">
            <span class="label-text">Rate Response</span>
            <span class="value-text">{{lineItem.value.rateResponse}}</span>
          </div>
        </div>

        <!-- ROW 2 -->
        <div class="row accessorial-details-row">
          <div class="col-xxl-2 col-md-3 col-sm-6 col-xs-6 accessorial-detail wrap-words">
            <span class="label-text">Created By</span>
            <span class="value-text">{{lineItem.value.createdBy}}</span>
          </div>
          <div class="col-xxl-1 col-md-2 col-sm-6 col-xs-6 accessorial-detail">
            <span class="label-text">Created Date</span>
            <span
              class="value-text">{{lineItem.value.createdDate !== 'N/A' ? (lineItem.value.createdDate | date: dateFormat) : 'N/A'}}</span>
          </div>
          <div *ngIf="lineItem.value.entrySource === 'CP'"
               class="col-xxl-9 col-md-7 col-sm-12 col-xs-12 accessorial-detail">
            <span class="label-text">Carrier Comment</span>
            <span class="value-text">{{lineItem.value.carrierComment}}</span>
          </div>
        </div>

        <!-- ROW 3 -->
        <div class="row accessorial-details-row-end">
          <div class="col-xxl-2 col-md-3 col-sm-6 col-xs-6 accessorial-detail wrap-words">
            <span class="label-text">Closed By</span>
            <span class="value-text">{{lineItem.value.closedBy}}</span>
          </div>
          <div class="col-xxl-1 col-md-2 col-sm-6 col-xs-6 accessorial-detail">
            <span class="label-text">Closed Date</span>
            <span
              class="value-text">{{lineItem.value.closedDate !== 'N/A' ? (lineItem.value.closedDate | date: dateFormat) : 'N/A'}}</span>
          </div>
          <div class="col-xxl-9 col-md-7 col-sm-12 col-xs-12 accessorial-detail">
            <span class="label-text">Response Comment</span>
            <span class="value-text">{{lineItem.value.responseComment}}</span>
          </div>
        </div>

      </div>
    </elm-card>
  `,
  styleUrls: ['./fal-accessorial-detail.component.scss']
})
export class FalAccessorialDetailComponent implements OnInit {

  public readonly dateFormat = 'MM-dd-YYYY';
  @Input() lineItem: AbstractControl = new UntypedFormControl({});

  constructor() {
  }

  ngOnInit(): void {
  }

}

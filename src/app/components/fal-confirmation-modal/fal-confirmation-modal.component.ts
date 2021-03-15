import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export interface FalConfirmationModalData {
  title: string;
  html: string;
  denyText: string;
  confirmText: string;
}

@Component({
  selector: 'app-fal-confirmation-modal',
  template: `
    <div class="d-flex justify-content-between">
      <h2 class="headline2 m-0">{{data.title}}</h2>
      <input type="button"
             class="material-icons flex-shrink-1 btn"
             value="close"
             (click)="deny()"
      />
    </div>
    <div [innerHTML]="data.html">
    </div>
    <div class="d-flex justify-content-between">
      <input type="button"
             class="flex-shrink-1 btn btn-primary"
             [value]="data.denyText"
             (click)="deny()"
      />
      <input type="button"
             class="flex-shrink-1 btn btn-outline-primary"
             [value]="data.confirmText"
             (click)="confirm()"
      />
    </div>
  `
})
export class FalConfirmationModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: FalConfirmationModalData,
              private dialogRef: MatDialogRef<FalConfirmationModalComponent>) {
  }

  ngOnInit(): void {
  }

  deny(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }

}



import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export interface InvoiceErrorModalData {
  title: string;
  html: string;
  closeText: string;
}

@Component({
  selector: 'app-invoice-amount-error-modal',
  template: `
    <div class="d-flex justify-content-between">
      <h2 class="headline2 m-0">{{data.title}}</h2>
    </div>
    <div [innerHTML]="data.html">
    </div>
    <div class="d-flex justify-content-end">
      <input type="button"
             class="flex-shrink-1 btn btn-primary"
             [value]="data.closeText"
             (click)="close()"
      />
    </div>
  `
})
export class InvoiceErrorModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: InvoiceErrorModalData,
              private dialogRef: MatDialogRef<InvoiceErrorModalComponent>) {
  }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close(false);
  }
}



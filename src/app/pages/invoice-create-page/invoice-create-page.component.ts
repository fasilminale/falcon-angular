import {Component, forwardRef, OnInit} from '@angular/core';
import {FormControl, FormGroup, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-invoice-create-page',
  templateUrl: './invoice-create-page.component.html',
  styleUrls: ['./invoice-create-page.component.scss']

})
export class InvoiceCreatePageComponent implements OnInit {
  formGroup: FormGroup;

  constructor() {
    this.formGroup = new FormGroup({
      invoiceAmount: new FormControl(0),
      companyCode: new FormControl(''),
      companyName: new FormControl(''),
      createdBy: new FormControl(''),
      createdDate: new FormControl(''),
      erpType: new FormControl(''),
      externalInvoiceNumber: new FormControl(''),
      externalInvoiceDate: new FormControl(''),
      falconInvoiceNumber: new FormControl(''),
      invoiceDate: new FormControl(''),
      vendorNumber: new FormControl(''),
      workType: new FormControl(''),
      currency: new FormControl('')
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
  }

}

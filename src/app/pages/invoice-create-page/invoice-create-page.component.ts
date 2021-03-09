import {Component, forwardRef, OnInit} from '@angular/core';
import {FormControl, FormGroup, NG_VALUE_ACCESSOR} from '@angular/forms';
import {WebServices} from '../../services/web-services';
import {environment} from '../../../environments/environment';
import {Invoice} from '../../models/invoice-model';

@Component({
  selector: 'app-invoice-create-page',
  templateUrl: './invoice-create-page.component.html',
  styleUrls: ['./invoice-create-page.component.scss']

})
export class InvoiceCreatePageComponent implements OnInit {
  formGroup: FormGroup;

  constructor(private webService: WebServices) {
    this.formGroup = new FormGroup({
      workType: new FormControl(''),
      companyCode: new FormControl(''),
      erpType: new FormControl(''),
      vendorNumber: new FormControl(''),
      externalInvoiceNumber: new FormControl(''),
      externalInvoiceDate: new FormControl(''),
      invoiceAmount: new FormControl(0),
      currency: new FormControl(''),
      createdBy: new FormControl(''),
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    const invoice = this.formGroup.getRawValue() as Invoice;
    invoice.createdBy = 'Falcon User';
    this.webService.httpPost(
      `${environment.baseServiceUrl}/v1/invoice`,
      invoice
    ).subscribe(_ => {
    });
    ;
  }

}

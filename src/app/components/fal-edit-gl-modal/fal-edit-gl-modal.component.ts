import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NewChargeModalInput} from '../fal-new-charge-modal/fal-new-charge-modal.component';
import {Subscription} from 'rxjs';
import {GlLineItemError} from '../../models/line-item/line-item-model';
import {buttonStyleOptions, ToastService} from '@elm/elm-styleguide-ui';
import {InvoiceService} from '../../services/invoice-service';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';

@Component({
  selector: 'app-fal-edit-gl-modal',
  templateUrl: './fal-edit-gl-modal.component.html',
  styleUrls: ['./fal-edit-gl-modal.component.scss']
})
export class FalEditGlModalComponent implements OnInit {

  public form: FormGroup;
  public invoiceFormGroup: any;
  public readonly allocationPercentControl: FormControl = new FormControl('');
  public readonly customerCategoryControl: FormControl = new FormControl('');
  public readonly glCostCenterControl: FormControl = new FormControl('');
  public readonly glProfitCenterControl: FormControl = new FormControl('');
  public readonly glAccountControl: FormControl = new FormControl('', Validators.required);
  public readonly glCompanyCodeControl: FormControl = new FormControl('', Validators.required);
  public readonly glAmountControl: FormControl = new FormControl('');
  private readonly subscriptions: Subscription = new Subscription();
  public invoiceAllocationErrors?: GlLineItemError;

  constructor(@Inject(MAT_DIALOG_DATA) public data: EditGlLineItemModal,
              public invoiceService: InvoiceService,
              private toastService: ToastService,
              private dialogRef: MatDialogRef<FalEditGlModalComponent>) {
    this.allocationPercentControl.patchValue(data.glLineItem.value.allocationPercent);
    this.customerCategoryControl.patchValue(data.glLineItem.value.customerCategory);
    this.glCostCenterControl.patchValue(data.glLineItem.value.glCostCenter);
    this.glProfitCenterControl.patchValue(data.glLineItem.value.glProfitCenter);
    this.glAccountControl.patchValue(data.glLineItem.value.glAccount);
    this.glCompanyCodeControl.patchValue(data.glLineItem.value.glCompanyCode);
    this.glAmountControl.patchValue(data.glLineItem.value.glAmount);

    this.invoiceFormGroup = data.invoiceFormGroup;

    this.form = new FormGroup({
      allocationPercent: this.allocationPercentControl,
      customerCategory: this.customerCategoryControl,
      glCostCenter: this.glCostCenterControl,
      glProfitCenter: this.glProfitCenterControl,
      glAccount: this.glAccountControl,
      glCompanyCode: this.glCompanyCodeControl,
      glAmount: this.glAmountControl
    });
  }

  ngOnInit(): void {
  }

  get validateGlLineItem(): boolean {
    return (this.form.get('glCostCenter')?.value || this.form.get('glProfitCenter')?.value)
      && this.form.get('glAccount')?.value && this.form.get('glCompanyCode')?.value;
  }

  confirm(): void {
    const glLineItems: any = JSON.parse(JSON.stringify(this.invoiceFormGroup.value.invoiceAllocation.invoiceAllocations));
    const currentGlLineItem = glLineItems.find((lineItem: any) => this.customerCategoryControl.value === lineItem.customerCategory);
    if (currentGlLineItem) {
      currentGlLineItem.glCostCenter = this.glCostCenterControl.value;
      currentGlLineItem.glProfitCenter = this.glProfitCenterControl.value;
      currentGlLineItem.glAccount = this.glAccountControl.value;
      currentGlLineItem.glCompanyCode = this.glCompanyCodeControl.value;
    }

    Object.keys(currentGlLineItem).forEach(key => {
      currentGlLineItem[key] = currentGlLineItem[key] === 'N/A' ? '' : currentGlLineItem[key];
    });

    this.invoiceService.validateGlLineItem(currentGlLineItem).subscribe(
      (lineItem: GlLineItemError) => {
        if (lineItem) {
          this.invoiceAllocationErrors = lineItem;
          this.toastService.openErrorToast('The Invoice Allocation line items have values which do not match with master data');
        } else {
          this.toastService.openSuccessToast('Success. Allocation line has updated.');
          this.dialogRef.close(glLineItems);
        }
      }
    );
  }
}


export type EditGlLineItemModal = {
  glLineItem: AbstractControl;
  invoiceFormGroup: AbstractControl;
};

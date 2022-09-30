import {Component, Inject} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {GlLineItem, GlLineItemError} from '../../models/line-item/line-item-model';
import {ToastService} from '@elm/elm-styleguide-ui';
import {InvoiceService} from '../../services/invoice-service';

@Component({
  selector: 'app-fal-edit-gl-modal',
  templateUrl: './fal-edit-gl-modal.component.html',
  styleUrls: ['./fal-edit-gl-modal.component.scss']
})
export class FalEditGlModalComponent {

  public form: FormGroup;
  public glLineItems: Array<GlLineItem>;
  public readonly allocationPercentControl: FormControl = new FormControl('');
  public readonly customerCategoryControl: FormControl = new FormControl('');
  public readonly glCostCenterControl: FormControl = new FormControl('');
  public readonly glProfitCenterControl: FormControl = new FormControl('');
  public readonly glAccountControl: FormControl = new FormControl('', Validators.required);
  public readonly glCompanyCodeControl: FormControl = new FormControl('', Validators.required);
  public readonly glAmountControl: FormControl = new FormControl('');
  public invoiceAllocationErrors?: GlLineItemError;

  constructor(@Inject(MAT_DIALOG_DATA) public data: EditGlLineItemModal,
              public invoiceService: InvoiceService,
              private toastService: ToastService,
              private dialogRef: MatDialogRef<FalEditGlModalComponent>) {
    const glLineItem = data.glLineItem;
    this.allocationPercentControl.patchValue(glLineItem.allocationPercent);
    this.customerCategoryControl.patchValue(glLineItem.customerCategory);
    this.glCostCenterControl.patchValue(glLineItem.glCostCenter);
    this.glProfitCenterControl.patchValue(glLineItem.glProfitCenter);
    this.glAccountControl.patchValue(glLineItem.glAccount);
    this.glCompanyCodeControl.patchValue(glLineItem.glCompanyCode);
    this.glAmountControl.patchValue(glLineItem.glAmount);

    // Disable controls
    this.allocationPercentControl.disable();
    this.customerCategoryControl.disable();

    this.glLineItems = data.glLineItems;

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

  get validateGlLineItem(): boolean {
    return (this.glCostCenterControl.value || this.glProfitCenterControl.value)
      && this.glAccountControl.value && this.glCompanyCodeControl.value;
  }

  confirm(): void {
    const currentGlLineItem: any = this.glLineItems.find(
      (lineItem: any) => this.customerCategoryControl.value === lineItem.customerCategory
    );
    if (currentGlLineItem) {
      currentGlLineItem.glCostCenter = this.glCostCenterControl.value;
      currentGlLineItem.glProfitCenter = this.glProfitCenterControl.value;
      currentGlLineItem.glAccount = this.glAccountControl.value;
      currentGlLineItem.glCompanyCode = this.glCompanyCodeControl.value;

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
            this.dialogRef.close(this.glLineItems);
          }
        }
      );
    }
  }
}


export type EditGlLineItemModal = {
  glLineItem: GlLineItem;
  glLineItems: Array<GlLineItem>;
};

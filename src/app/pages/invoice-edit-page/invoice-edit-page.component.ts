import {Component, Inject, OnInit} from '@angular/core';
import {UtilService} from '../../services/util-service';
import {Milestone} from '../../models/milestone/milestone-model';
import {FormGroup} from '@angular/forms';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {SUBSCRIPTION_MANAGER, SubscriptionManager} from '../../services/subscription-manager';
import {UserService} from '../../services/user-service';
import {InvoiceService} from '../../services/invoice-service';
import {Observable, Subject} from 'rxjs';
import {EntryType, InvoiceDataModel} from '../../models/invoice/invoice-model';
import {StatusUtil} from '../../models/invoice/status-model';
import {FreightPaymentTerms, InvoiceAllocationDetail, TripInformation} from '../../models/invoice/trip-information-model';
import {SubjectValue} from '../../utils/subject-value';
import {FalUserInfo} from '../../models/user-info/user-info-model';
import {InvoiceOverviewDetail} from 'src/app/models/invoice/invoice-overview-detail.model';
import {ToastService} from '@elm/elm-styleguide-ui';
import { InvoiceAmountDetail } from 'src/app/models/invoice/invoice-amount-detail-model';


@Component({
  selector: 'app-invoice-edit-page',
  templateUrl: './invoice-edit-page.component.html',
  styleUrls: ['./invoice-edit-page.component.scss']
})
export class InvoiceEditPageComponent implements OnInit {

  public falconInvoiceNumber = '';
  public invoiceStatus = '';
  public milestones: Array<Milestone> = [];
  public userInfo?: FalUserInfo;
  public isDeletedInvoice = false;
  public isSubmittedInvoice = false;
  public isApprovedInvoice = false;
  public isRejectedInvoice = false;
  public isMilestoneTabOpen = false;
  public isAutoInvoice = false;
  public showMilestoneToggleButton = true;
  public invoiceFormGroup: FormGroup;
  public tripInformationFormGroup: FormGroup;
  public invoiceAmountFormGroup: FormGroup;
  public invoiceAllocationFormGroup: FormGroup;

  public isEditMode$ = new SubjectValue(false);
  public loadTripInformation$ = new Subject<TripInformation>();
  public loadInvoiceOverviewDetail$ = new Subject<InvoiceOverviewDetail>();
  public loadInvoiceAmountDetail$ = new Subject<InvoiceAmountDetail>();
  public loadAllocationDetails$ = new Subject<InvoiceAllocationDetail>();

  constructor(private util: UtilService,
              private router: Router,
              private route: ActivatedRoute,
              private userService: UserService,
              private invoiceService: InvoiceService,
              private toastService: ToastService,
              @Inject(SUBSCRIPTION_MANAGER) private subscriptions: SubscriptionManager) {
    this.tripInformationFormGroup = new FormGroup({});
    this.invoiceAmountFormGroup = new FormGroup({});
    this.invoiceAllocationFormGroup = new FormGroup({});
    this.invoiceFormGroup = new FormGroup({
      tripInformation: this.tripInformationFormGroup,
      invoiceAmount: this.invoiceAmountFormGroup,
      invoiceAllocation: this.invoiceAllocationFormGroup
    });
  }

  ngOnInit(): void {
    this.subscriptions.manage(
      this.route.paramMap.subscribe(p => this.handleRouteParams(p)),
      this.userService.getUserInfo().subscribe(u => this.loadUserInfo(u))
    );
  }

  private handleRouteParams(params: ParamMap): void {
    this.falconInvoiceNumber = params.get('falconInvoiceNumber') ?? '';
    if (this.falconInvoiceNumber) {
      this.subscriptions.manage(
        this.invoiceService.getInvoice(this.falconInvoiceNumber)
          .subscribe(i => this.loadInvoice(i))
      );
    }
  }

  private loadInvoice(invoice: InvoiceDataModel): void {
    this.milestones = invoice.milestones;
    this.isDeletedInvoice = StatusUtil.isDeleted(invoice.status);
    this.isSubmittedInvoice = StatusUtil.isSubmitted(invoice.status);
    this.isApprovedInvoice = StatusUtil.isApproved(invoice.status);
    this.isAutoInvoice = invoice.entryType === EntryType.AUTO;
    this.invoiceStatus = invoice.status.label;
    this.loadTripInformation$.next({
      tripId: invoice.tripId,
      invoiceDate: new Date(invoice.invoiceDate),
      pickUpDate: invoice.pickupDateTime ? new Date(invoice.pickupDateTime) : undefined,
      deliveryDate: invoice.deliveryDateTime ? new Date(invoice.deliveryDateTime) : undefined,
      proTrackingNumber: invoice.proNumber ? invoice.proNumber : 'N/A',
      bolNumber: invoice.billOfLadingNumber ? invoice.billOfLadingNumber : 'N/A' ,
      freightPaymentTerms: invoice.freightPaymentTerms as FreightPaymentTerms,
      originAddress: {...invoice.origin, shippingPoint: invoice.shippingPoint},
      destinationAddress: {...invoice.destination, shippingPoint: invoice.shippingPoint},
      billToAddress: {...invoice.billTo, shippingPoint: invoice.shippingPoint},
      serviceLevel: invoice.serviceLevel,
      carrier: invoice.carrier,
      carrierMode: invoice.mode,
      freightOrders: invoice.freightOrders
    });
    this.loadInvoiceOverviewDetail$.next({
      invoiceNetAmount: invoice.amountOfInvoice ? parseInt(invoice.amountOfInvoice) : 0.0,
      invoiceDate: new Date(invoice.invoiceDate),
      businessUnit: invoice.businessUnit,
      billToAddress: invoice.billTo,
      paymentDue: new Date(invoice.paymentDue),
      carrier: `${invoice?.carrier?.scac} (${invoice?.carrier?.name})`,
      carrierMode: `${invoice.mode?.reportKeyMode} (${invoice.mode?.reportModeDescription})`,
      freightPaymentTerms: invoice.freightPaymentTerms,
      remittanceInformation: {
        erpInvoiceNumber: invoice.erpInvoiceNumber,
        erpRemittanceNumber: invoice.erpRemittanceNumber,
        vendorId: invoice.remitVendorId,
        amountOfPayment: parseInt(invoice.amountOfPayment),

      }
    });

    this.loadInvoiceAmountDetail$.next({
      costLineItems: invoice.costLineItems,
      amountOfInvoice: invoice.amountOfInvoice,
      mileage: invoice.distance,
      currency: invoice.currency,
      standardPaymentTermsOverride: invoice.standardPaymentTermsOverride
    })

    this.loadAllocationDetails$.next({
      totalGlAmount: invoice.totalGlAmount,
      invoiceNetAmount: invoice.amountOfInvoice,
      glLineItems: invoice.glLineItems
    });
  }

  private loadUserInfo(newUserInfo: FalUserInfo): void {
    this.userInfo = newUserInfo;
  }

  clickSaveAsTemplateButton(): void {
    this.showNotYetImplementedModal('Save As Template');
  }

  clickDeleteButton(): void {
    const dialogResult: Observable<string | boolean> =
      this.requireDeleteReason()
        ? this.util.openDeleteModal()
        : this.util.openConfirmationModal({
          title: 'Delete Invoice',
          innerHtmlMessage: `Are you sure you want to delete this invoice?
               <br/><br/><strong>This action cannot be undone.</strong>`,
          confirmButtonText: 'Delete Invoice',
          confirmButtonStyle: 'destructive',
          cancelButtonText: 'Cancel'
        });
    dialogResult.subscribe((result: string | boolean) => {
      if (result) {
        const request = this.requireDeleteReason()
          ? this.deleteInvoiceWithReason({deletedReason: result})
          : this.deleteInvoice();
        request.subscribe(
          () => this.router.navigate(
            [`/invoices`],
            {queryParams: {falconInvoiceNumber: this.falconInvoiceNumber}}
          ),
          () => this.toastService.openErrorToast(
            `Failure, invoice was not deleted.`
          )
        );
      }
    });
  }

  clickToggleEditMode(): void {
    this.isEditMode$.value = !this.isEditMode$.value;
  }

  clickToggleMilestoneTab(): void {
    this.isMilestoneTabOpen = !this.isMilestoneTabOpen;
  }

  clickCancelButton(): void {
    this.router.navigate(['/invoices']);
  }

  clickSaveButton(): void {
    this.showNotYetImplementedModal('Save Invoice');
  }

  clickSubmitForApprovalButton(): void {
    this.showNotYetImplementedModal('Submit For Approval');
  }

  private showNotYetImplementedModal(title: string): void {
    this.subscriptions.manage(this.util.openErrorModal({
      title, innerHtmlMessage: 'Not Yet Implemented On This Page'
    }).subscribe());
  }

  private deleteInvoice(): Observable<any> {
    return this.invoiceService.deleteInvoice(this.falconInvoiceNumber);
  }

  private deleteInvoiceWithReason(deletedReasonParameters: any): Observable<any> {
    return this.invoiceService.deleteInvoiceWithReason(this.falconInvoiceNumber, deletedReasonParameters);
  }

  private requireDeleteReason(): boolean {
    return this.isAutoInvoice && this.isApprovedInvoice;
  }
}

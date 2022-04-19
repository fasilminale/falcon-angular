import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {UtilService} from '../../services/util-service';
import {Milestone} from '../../models/milestone/milestone-model';
import {FormGroup} from '@angular/forms';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {SUBSCRIPTION_MANAGER, SubscriptionManager} from '../../services/subscription-manager';
import {UserService} from '../../services/user-service';
import {InvoiceService} from '../../services/invoice-service';
import {Observable, of, Subject} from 'rxjs';
import {EntryType, InvoiceDataModel} from '../../models/invoice/invoice-model';
import {StatusUtil} from '../../models/invoice/status-model';
import {FreightPaymentTerms, InvoiceAllocationDetail, TripInformation} from '../../models/invoice/trip-information-model';
import {SubjectValue} from '../../utils/subject-value';
import {UserInfoModel} from '../../models/user-info/user-info-model';
import {InvoiceOverviewDetail} from 'src/app/models/invoice/invoice-overview-detail.model';
import {ElmLinkInterface, ToastService} from '@elm/elm-styleguide-ui';
import { InvoiceAmountDetail } from 'src/app/models/invoice/invoice-amount-detail-model';
import {ElmUamRoles} from '../../utils/elm-uam-roles';
import {RateEngineRequest, RateDetailResponse, RatesResponse} from '../../models/rate-engine/rate-engine-request';
import {RateService} from '../../services/rate-service';


@Component({
  selector: 'app-invoice-edit-page',
  templateUrl: './invoice-edit-page.component.html',
  styleUrls: ['./invoice-edit-page.component.scss']
})
export class InvoiceEditPageComponent implements OnInit {

  breadcrumbs: Array<ElmLinkInterface> = [{label: 'All Invoices', path: `/invoices`}];
  public falconInvoiceNumber = '';
  public invoiceStatus = '';
  public milestones: Array<Milestone> = [];
  public userInfo: UserInfoModel | undefined;
  public isDeletedInvoice = false;
  public isApprovedInvoice = false;
  public isMilestoneTabOpen = false;
  public isAutoInvoice = false;
  public isEditableInvoice = true;
  public showMilestoneToggleButton = true;
  public invoiceFormGroup: FormGroup;
  public tripInformationFormGroup: FormGroup;
  public invoiceAmountFormGroup: FormGroup;
  public invoiceAllocationFormGroup: FormGroup;

  public isEditMode$ = new SubjectValue<boolean>(false);
  public loadTripInformation$ = new Subject<TripInformation>();
  public loadInvoiceOverviewDetail$ = new Subject<InvoiceOverviewDetail>();
  public loadInvoiceAmountDetail$ = new Subject<InvoiceAmountDetail>();
  public loadAllocationDetails$ = new Subject<InvoiceAllocationDetail>();
  public chargeLineItemOptions$ = new Subject<RateDetailResponse>();
  public rateEngineCallResult$ = new Subject<RatesResponse>();

  private readonly requiredPermissions = [ElmUamRoles.ALLOW_INVOICE_WRITE];
  public invoice: InvoiceDataModel = new InvoiceDataModel();
  public hasInvoiceWrite = false;

  constructor(private util: UtilService,
              private route: ActivatedRoute,
              private userService: UserService,
              private invoiceService: InvoiceService,
              private toastService: ToastService,
              private rateService: RateService,
              @Inject(SUBSCRIPTION_MANAGER) private subscriptions: SubscriptionManager,
              public router: Router) {
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
    this.invoice = invoice;
    this.milestones = invoice.milestones;
    this.isDeletedInvoice = StatusUtil.isDeleted(invoice.status);
    this.isApprovedInvoice = StatusUtil.isApproved(invoice.status);
    this.isEditableInvoice = StatusUtil.isEditable(invoice.status);
    this.isAutoInvoice = invoice.entryType === EntryType.AUTO;
    this.invoiceStatus = invoice.status.label;
    console.log(`invoice override ${invoice.overriddenDeliveryDateTime}`)
    console.log(`invoice assumed ${invoice.assumedDeliveryDateTime}`)
    this.loadTripInformation$.next({
      tripId: invoice.tripId,
      invoiceDate: new Date(invoice.invoiceDate),
      pickUpDate: invoice.pickupDateTime ? new Date(invoice.pickupDateTime) : undefined,
      deliveryDate: invoice.deliveryDateTime ? new Date(invoice.deliveryDateTime) : undefined,
      proTrackingNumber: invoice.proNumber ? invoice.proNumber : 'N/A',
      bolNumber: invoice.billOfLadingNumber ? invoice.billOfLadingNumber : 'N/A',
      freightPaymentTerms: invoice.freightPaymentTerms as FreightPaymentTerms,
      originAddress: {...invoice.origin, shippingPoint: invoice.shippingPoint},
      destinationAddress: {...invoice.destination, shippingPoint: invoice.shippingPoint},
      billToAddress: {...invoice.billTo, shippingPoint: invoice.shippingPoint},
      serviceLevel: invoice.serviceLevel,
      carrier: invoice.carrier,
      carrierMode: invoice.mode,
      freightOrders: invoice.freightOrders,
      overriddenDeliveryDateTime: invoice.overriddenDeliveryDateTime ? new Date(invoice.overriddenDeliveryDateTime) : undefined,
      assumedDeliveryDateTime: invoice.assumedDeliveryDateTime ? new Date(invoice.assumedDeliveryDateTime) : undefined,
    });
    this.loadInvoiceOverviewDetail$.next({
      invoiceNetAmount: invoice.amountOfInvoice ? parseFloat(invoice.amountOfInvoice) : 0.0,
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
        amountOfPayment: parseFloat(invoice.amountOfPayment),
      }
    });

    this.loadInvoiceAmountDetail$.next({
      costLineItems: invoice.costLineItems,
      amountOfInvoice: invoice.amountOfInvoice,
      mileage: invoice.distance,
      currency: invoice.currency,
      standardPaymentTermsOverride: invoice.standardPaymentTermsOverride
    });

    this.loadAllocationDetails$.next({
      totalGlAmount: invoice.totalGlAmount,
      invoiceNetAmount: invoice.amountOfInvoice,
      glLineItems: invoice.glLineItems
    });
  }

  private loadUserInfo(newUserInfo: UserInfoModel): void {
    this.userInfo = new UserInfoModel(newUserInfo);
    this.hasInvoiceWrite = this.userInfo.hasPermission(this.requiredPermissions);
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

  private createRequest(accessorialCode: string): RateEngineRequest {
    return {
      mode: this.invoice.mode.mode,
      scac: this.invoice.carrier.scac,
      shipDate: this.invoice.pickupDateTime,
      origin: {
        streetAddress: this.invoice.origin.address,
        locCode: '',
        city: this.invoice.origin.city,
        state: this.invoice.origin.state,
        zip: this.invoice.origin.zipCode,
        country: this.invoice.origin.country
      },
      destination: {
        streetAddress: this.invoice.destination.address,
        locCode: '',
        city: this.invoice.destination.city,
        state: this.invoice.destination.state,
        zip: this.invoice.destination.zipCode,
        country: this.invoice.destination.country
      },
      accessorialCodes: accessorialCode ? [accessorialCode] : [],
      invoice: this.invoice
    };
  }

  /**
   *  Retrieves all available accessorials for the current invoice.
   *  Cost breakdown options are populated with the results from this call.
   *  Rate management is not called if checkAccessorialData() returns false,indicating required data is missing.
   */
  getAccessorialList(): void {
    if (this.checkAccessorialData(this.invoice)) {
      const request: RateEngineRequest = this.createRequest('');
      this.subscriptions.manage(
        this.rateService.getAccessorialDetails(request).subscribe(result => this.chargeLineItemOptions$.next(result))
      );
    }
  }

  /**
   *  Retrieves the rate for a provided accessorial code.
   *  Populates the line item information for the selected accessorial code.
   *  Rate management is not called if checkAccessorialData() returns false,indicating required data is missing.
   */
  getRates(accessorialCode: string): void {
    if (this.checkAccessorialData(this.invoice) && accessorialCode) {
      const request: RateEngineRequest = this.createRequest(accessorialCode);
      this.subscriptions.manage(
        this.rateService.getRates(request).subscribe(response => this.rateEngineCallResult$.next(response))
      );
    }
  }

  /**
   *  Checks for the required accessorial data.
   *    Carrier Mode
   *    Carrier Scac
   *    Shipping Date
   *    Origin Address
   *    Destination Address
   */
  private checkAccessorialData(invoice: InvoiceDataModel): boolean {
    const modeExists: boolean = invoice.mode != null && invoice.mode.mode != null;
    const carrierExists: boolean = invoice.carrier != null && invoice.carrier.scac != null;
    const shipDateExists: boolean = invoice.pickupDateTime != null;
    const originExists: boolean = invoice.origin != null;
    const destinationExists: boolean = invoice.destination != null;
    return modeExists && carrierExists && shipDateExists && originExists && destinationExists;
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

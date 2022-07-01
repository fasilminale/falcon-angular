import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {CommentModel, UtilService} from '../../services/util-service';
import {Milestone} from '../../models/milestone/milestone-model';
import {AbstractControl, FormArray, FormGroup} from '@angular/forms';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {SUBSCRIPTION_MANAGER, SubscriptionManager} from '../../services/subscription-manager';
import {UserService} from '../../services/user-service';
import {InvoiceService} from '../../services/invoice-service';
import {Observable, Observer, Subject} from 'rxjs';
import {EntryType, InvoiceDataModel} from '../../models/invoice/invoice-model';
import {StatusUtil} from '../../models/invoice/status-model';
import {FreightPaymentTerms, InvoiceAllocationDetail, TripInformation} from '../../models/invoice/trip-information-model';
import {SubjectValue} from '../../utils/subject-value';
import {UserInfoModel} from '../../models/user-info/user-info-model';
import {InvoiceOverviewDetail} from 'src/app/models/invoice/invoice-overview-detail.model';
import {ConfirmationModalData, ElmLinkInterface, ToastService} from '@elm/elm-styleguide-ui';
import {InvoiceAmountDetail} from 'src/app/models/invoice/invoice-amount-detail-model';
import {ElmUamRoles} from '../../utils/elm-uam-roles';
import {RateEngineRequest, RateDetailResponse, RatesResponse} from '../../models/rate-engine/rate-engine-request';
import {RateService} from '../../services/rate-service';
import {EditAutoInvoiceModel} from '../../models/invoice/edit-auto-invoice.model';
import {switchMap} from 'rxjs/operators';
import {TripInformationComponent} from './trip-information/trip-information.component';
import {Location} from '../../models/location/location-model';
import {CostLineItem, DisputeLineItem} from '../../models/line-item/line-item-model';
import {KeyedLabel} from '../../models/generic/keyed-label';


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
  @ViewChild(TripInformationComponent) tripInformationComponent!: TripInformationComponent;

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

  public loadInvoice(invoice: InvoiceDataModel): void {
    this.invoice = invoice;
    this.milestones = invoice.milestones;
    this.isDeletedInvoice = StatusUtil.isDeleted(invoice.status);
    this.isApprovedInvoice = StatusUtil.isApproved(invoice.status);
    this.isEditableInvoice = StatusUtil.isEditable(invoice.status);
    this.isAutoInvoice = invoice.entryType === EntryType.AUTO;
    this.invoiceStatus = invoice.status.label;
    this.loadTripInformation$.next({
      tripId: invoice.tripId,
      vendorNumber: invoice.vendorNumber ?? undefined,
      invoiceDate: new Date(invoice.invoiceDate),
      pickUpDate: invoice.pickupDateTime ? new Date(invoice.pickupDateTime) : undefined,
      createdDate: invoice.createdDate ? new Date(invoice.createdDate) : undefined,
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
      tripTenderTime: invoice.tripTenderTime ? new Date(invoice.tripTenderTime) : undefined
    });
    this.loadInvoiceOverviewDetail$.next({
      invoiceNetAmount: invoice.amountOfInvoice ? parseFloat(invoice.amountOfInvoice) : 0.0,
      invoiceDate: new Date(invoice.invoiceDate),
      businessUnit: invoice.businessUnit,
      billToAddress: invoice.billTo,
      paymentDue: new Date(invoice.paymentDue),
      carrier: `${invoice.carrier?.scac} (${invoice.carrier?.name})`,
      carrierMode: `${invoice.mode?.reportKeyMode} (${invoice.mode?.reportModeDescription})`,
      freightPaymentTerms: invoice.freightPaymentTerms,
      remitHistory: invoice.remitHistory
    });

    this.loadInvoiceAmountDetail$.next({
      costLineItems: invoice.costLineItems,
      pendingChargeLineItems: invoice.pendingChargeLineItems,
      deniedChargeLineItems: invoice.deniedChargeLineItems,
      deletedChargeLineItems: invoice.deletedChargeLineItems,
      disputeLineItems: invoice.disputeLineItems,
      amountOfInvoice: invoice.amountOfInvoice,
      mileage: invoice.distance,
      currency: invoice.currency,
      standardPaymentTermsOverride: invoice.standardPaymentTermsOverride
    });

    this.loadAllocationDetails$.next({
      totalGlAmount: invoice.totalGlAmount,
      invoiceNetAmount: invoice.amountOfInvoice,
      glLineItems: invoice.glLineItems,
      glLineItemsErrors: this.invoice.glLineItemsErrors,
      glLineItemsInvalid: this.invoice.glLineItemsInvalid
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
    const modalData: ConfirmationModalData = {
      title: 'Delete Invoice',
      innerHtmlMessage: `Are you sure you want to delete this invoice?
               <br/><br/><strong>This action cannot be undone.</strong>`,
      confirmButtonText: 'Delete Invoice',
      confirmButtonStyle: 'destructive',
      cancelButtonText: 'Cancel'
    };
    const dialogResult: Observable<CommentModel | boolean> =
      this.requireDeleteReason()
        ? this.util.openCommentModal({
          ...modalData,
          commentSectionFieldName: 'Reason for Deletion',
          requireField: true
        })
        : this.util.openConfirmationModal(modalData);
    dialogResult.subscribe((result: CommentModel | boolean) => {
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

  public disputeAction(action: string): void {
    const dialogResult: Observable<any> =
      this.util.openCommentModal({
        title: `${action} Dispute`,
        innerHtmlMessage: `Are you sure you want to ${action.toLowerCase()} this dispute?
               <br/><br/><strong>This action cannot be undone.</strong>`,
        confirmButtonText: `${action} Dispute`,
        confirmButtonStyle: action === 'Deny' ? 'destructive' : 'primary',
        cancelButtonText: 'Cancel',
        commentSectionFieldName: 'Response Comment',
        requireField: action === 'Deny'
      });
    dialogResult.subscribe(result => {
      if (result) {
        const request = this.resolveDispute(
          {action: action === 'Deny' ? 'DENIED' : 'ACCEPTED', comment: result.comment, userId: this.userInfo?.email}
        );
        request.subscribe(
          (invoice: InvoiceDataModel) => {
            this.toastService.openSuccessToast(`Success, dispute was closed.`);
            this.loadInvoiceAmountDetail$.next({
              costLineItems: invoice.costLineItems,
              pendingChargeLineItems: invoice.pendingChargeLineItems,
              deniedChargeLineItems: invoice.deniedChargeLineItems,
              disputeLineItems: invoice.disputeLineItems,
              deletedChargeLineItems: invoice.deletedChargeLineItems,
              amountOfInvoice: invoice.amountOfInvoice,
              mileage: invoice.distance,
              currency: invoice.currency,
              standardPaymentTermsOverride: invoice.standardPaymentTermsOverride
            });
          },
          () => this.toastService.openErrorToast(
            `Failure, dispute was not closed.`
          )
        );
      }
    });
  }

  clickToggleEditMode(): void {
    this.isEditMode$.value = !this.isEditMode$.value;
    this.invoiceFormGroup.markAsPristine();
  }

  clickToggleMilestoneTab(): void {
    this.isMilestoneTabOpen = !this.isMilestoneTabOpen;
  }

  public askForCancelConfirmation(): Observable<boolean> {
    return this.util.openConfirmationModal({
      title: 'Cancel',
      innerHtmlMessage: `All changes to this invoice will be lost if you cancel now.
                   <br/><br/><strong>
                   Are you sure you want to cancel?
                   </strong>`,
      confirmButtonText: 'Yes, cancel',
      confirmButtonStyle: 'destructive',
      cancelButtonText: 'No, go back'
    });
  }

  clickCancelButton(): void {
    if (this.isEditMode$.value && this.invoiceFormGroup.dirty) {
      this.askForCancelConfirmation().subscribe(result => {
        if (result) {
          this.router.navigate(['/invoices']);
        }
      });
    } else {
      this.router.navigate(['/invoices']);
    }
  }

  clickSaveButton(): void {
    if (this.invoiceFormGroup.valid && this.tripInformationComponent.carrierDetailFound) {
      this.subscriptions.manage(
        this.updateInvoice().subscribe(
          (value) => {
            if (!value.glLineItemsInvalid) {
              this.performPostUpdateActions(`Success! Falcon Invoice ${this.falconInvoiceNumber} has been updated.`);
            } else {
              this.toastService.openErrorToast('The Invoice Allocations line items have values which do not match with master data.');
              this.clickToggleEditMode();
              this.subscriptions.manage(
                new Observable((observer: Observer<object>) => {
                  observer.next({});
                }).subscribe(i => this.loadInvoice(value))
              );
            }
          },
          (error) => {
            console.error(error);
          }
        )
      );
    }
  }

  updateInvoice(): Observable<InvoiceDataModel> {
    return this.invoiceService.updateAutoInvoice(this.mapTripInformationToEditAutoInvoiceModel(), this.falconInvoiceNumber);
  }

  clickSubmitForApprovalButton(): void {
    if (this.invoiceFormGroup.valid && this.tripInformationComponent.carrierDetailFound) {
      this.subscriptions.manage(
        this.updateInvoice().pipe(
          switchMap((model: InvoiceDataModel) => {
            return this.invoiceService.submitForApproval(model.falconInvoiceNumber);
          })
        ).subscribe(
          (value) => {
            this.performPostUpdateActions(
              `Success! Falcon Invoice ${this.falconInvoiceNumber} has been updated and submitted for approval.`
            );
          },
          (error) => console.error(error)
        )
      );
    }
  }

  performPostUpdateActions(successMessage: string): void {
    window.scrollTo({top: 0, behavior: 'smooth'});
    this.ngOnInit();
    this.clickToggleEditMode();
    this.toastService.openSuccessToast(successMessage);
  }

  mapTripInformationToEditAutoInvoiceModel(): EditAutoInvoiceModel {
    const editAutoInvoiceModel: EditAutoInvoiceModel = {
      amountOfInvoice: this.invoiceAmountFormGroup.controls.amountOfInvoice.value,
      costLineItems: this.getLineItems(this.invoiceAmountFormGroup.controls.costBreakdownItems),
      pendingChargeLineItems: this.getLineItems(this.invoiceAmountFormGroup.controls.pendingChargeLineItems),
      disputeLineItems: this.getDisputeLineItems(this.invoiceAmountFormGroup.controls.disputeLineItems),
      deniedChargeLineItems: this.getLineItems(this.invoiceAmountFormGroup.controls.deniedChargeLineItems),
      deletedChargeLineItems: this.getLineItems(this.invoiceAmountFormGroup.controls.deletedChargeLineItems),
      mode: {
        mode: this.tripInformationFormGroup.controls.carrierMode.value.mode,
        reportKeyMode: this.tripInformationFormGroup.controls.carrierMode.value.reportKeyMode,
        reportModeDescription: this.tripInformationFormGroup.controls.carrierMode.value.reportModeDescription
      },
      carrier: {
        scac: this.tripInformationFormGroup.controls.carrier.value.scac,
        name: this.tripInformationFormGroup.controls.carrier.value.name,
      },
      serviceLevel: {
        level: this.tripInformationFormGroup.controls.serviceLevel.value.level,
        name: this.tripInformationFormGroup.controls.serviceLevel.value.name,
      },
      pickupDateTime: this.tripInformationFormGroup.controls.pickUpDate.value,
      glLineItemList: this.invoiceAllocationFormGroup.controls.invoiceAllocations.value
    };
    return editAutoInvoiceModel;
  }

  updateInvoiceFromForms(): void {
    this.invoice.mode = this.tripInformationFormGroup.controls.carrierMode?.value;
    this.invoice.carrier = this.tripInformationFormGroup.controls.carrier?.value;
    const originAddressFormGroup = this.tripInformationFormGroup.controls.originAddress as FormGroup;
    this.invoice.origin = this.extractLocation(originAddressFormGroup);
    const destinationAddressFormGroup = this.tripInformationFormGroup.controls.destinationAddress as FormGroup;
    this.invoice.destination = this.extractLocation(destinationAddressFormGroup);
    this.invoice.costLineItems = this.getLineItems(this.invoiceAmountFormGroup.controls.costBreakdownItems);
    this.invoice.pendingChargeLineItems = this.getLineItems(this.invoiceAmountFormGroup.controls.pendingChargeLineItems);
  }

  extractLocation(locationFormGroup: FormGroup): Location {
    return {
      name: this.handleNAValues(locationFormGroup?.controls?.name?.value),
      city: this.handleNAValues(locationFormGroup?.controls?.city?.value),
      country: this.handleNAValues(locationFormGroup?.controls?.country?.value),
      zipCode: this.handleNAValues(locationFormGroup?.controls?.zipCode?.value),
      state: this.handleNAValues(locationFormGroup?.controls?.state?.value),
      address: this.handleNAValues(locationFormGroup?.controls?.streetAddress?.value),
      address2: this.handleNAValues(locationFormGroup?.controls?.streetAddress2?.value)
    };
  }

  getDisputeLineItems(items: AbstractControl): Array<DisputeLineItem> {
    const results: Array<DisputeLineItem> = [];
    const lineItems = items as FormArray;
    if (!lineItems?.controls) {
      return [];
    }
    for (const control of lineItems.controls) {
      const item = control as FormGroup;
      results.push({

        comment: this.handleNAValues(item.controls?.comment?.value),
        attachment: this.handleNAValues(item.controls?.attachment?.value),
        createdDate: this.handleNAValues(item.controls?.createdDate?.value),
        createdBy: this.handleNAValues(item.controls?.createdBy?.value),
        disputeStatus: {
          key: this.handleNAValues(item.controls?.disputeStatus?.value?.key),
          label: this.handleNAValues(item.controls?.disputeStatus?.value?.label)
        },
        responseComment: this.handleNAValues(item.controls?.responseComment?.value),
        closedDate: this.handleNAValues(item.controls?.closedDate?.value),
        closedBy: this.handleNAValues(item.controls?.closedBy?.value)

      });
    }
    return results;
  }

  getLineItems(items: AbstractControl): Array<CostLineItem> {
    const results: Array<CostLineItem> = [];
    const lineItems = items as FormArray;
    if (!lineItems?.controls) {
      return [];
    }
    for (const control of lineItems.controls) {
      const item = control as FormGroup;
      results.push({
        accessorialCode: this.handleNAValues(item.controls?.accessorialCode?.value),
        chargeCode: this.handleNAValues(item.controls?.charge?.value),
        attachment: this.handleNAValues(item.controls?.attachment?.value),
        attachmentRequired: this.handleNAValues(item.controls?.attachmentRequired?.value),
        autoApproved: this.handleNAValues(item.controls?.autoApproved?.value),
        carrierComment: this.handleNAValues(item.controls?.carrierComment?.value),
        chargeLineTotal: this.handleNAValues(item.controls?.totalAmount?.value),
        closedBy: this.handleNAValues(item.controls?.closedBy?.value),
        closedDate: this.handleNAValues(item.controls?.closedDate?.value),
        costName: '',
        createdBy: this.handleNAValues(item.controls?.createdBy?.value),
        createdDate: this.handleNAValues(item.controls?.createdDate?.value),
        entrySource: this.handleNAValues(item.controls?.entrySourcePair?.value),
        expanded: false,
        fuel: this.handleNAValues(item.controls?.fuel?.value),
        manual: this.handleNAValues(item.controls?.manual?.value),
        message: this.handleNAValues(item.controls?.message?.value),
        planned: this.handleNAValues(item.controls?.planned?.value),
        quantity: this.handleNAValues(item.controls?.quantity?.value),
        rateAmount: this.handleNAValues(item.controls?.rate?.value),
        rateResponse: this.handleNAValues(item.controls?.rateResponse?.value),
        rateSource: this.handleNAValues(item.controls?.rateSourcePair?.value),
        rateType: this.handleNAValues(item.controls?.type?.value),
        requestStatus: this.handleNAValues(item.controls?.requestStatusPair?.value),
        responseComment: this.handleNAValues(item.controls?.responseComment?.value),
        lineItemType: this.handleNAValues(item.controls?.lineItemType?.value),
        variables: item.controls?.variables?.value ?? []
      });
    }
    return results;
  }

  private handleNAValues(value: any, defaultValue?: any): any {
    return value === 'N/A' ? defaultValue : value;
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
    this.updateInvoiceFromForms();
    if (this.checkAccessorialData(this.invoice)) {
      this.rateService.rateInvoice({
        ...this.invoice,
        deliveryInstructions: this.invoice.hasRateEngineError ? this.invoice.deliveryInstructions : []
      }).subscribe(
        ratedInvoiced => {
          this.toastService.openSuccessToast(`Success. Invoice charges have been re-rated`);
          this.loadInvoice(ratedInvoiced);
        }
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

  private resolveDispute(disputeParameters: any): Observable<any> {
    return this.invoiceService.resolveDispute(this.falconInvoiceNumber, disputeParameters);
  }
}

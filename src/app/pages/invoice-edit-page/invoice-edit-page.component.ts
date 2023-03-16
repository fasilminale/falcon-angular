import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommentModel, UtilService} from '../../services/util-service';
import {Milestone} from '../../models/milestone/milestone-model';
import {AbstractControl, UntypedFormArray, UntypedFormGroup} from '@angular/forms';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {UserService} from '../../services/user-service';
import {InvoiceService} from '../../services/invoice-service';
import {ATTACHMENT_SERVICE, AttachmentService} from '../../services/attachment-service';
import {Observable, Observer, Subject, Subscription} from 'rxjs';
import {EntryType, InvoiceDataModel} from '../../models/invoice/invoice-model';
import {StatusUtil} from '../../models/invoice/status-model';
import {FreightPaymentTerms, InvoiceAllocationDetail, TripInformation} from '../../models/invoice/trip-information-model';
import {SubjectValue} from '../../utils/subject-value';
import {UserInfoModel} from '../../models/user-info/user-info-model';
import {InvoiceOverviewDetail} from 'src/app/models/invoice/invoice-overview-detail.model';
import {ConfirmationModalData, ElmLinkInterface, ToastService, ModalService} from '@elm/elm-styleguide-ui';
import {InvoiceAmountDetail} from 'src/app/models/invoice/invoice-amount-detail-model';
import {ElmUamPermission} from '../../utils/elm-uam-permission';
import {RateEngineRequest, RateDetailResponse} from '../../models/rate-engine/rate-engine-request';
import {RateService} from '../../services/rate-service';
import {EditAutoInvoiceModel} from '../../models/invoice/edit-auto-invoice.model';
import {first, switchMap} from 'rxjs/operators';
import {TripInformationComponent} from './trip-information/trip-information.component';
import {BillToLocationUtils, CommonUtils, LocationUtils} from '../../models/location/location-model';
import {CostLineItem, DisputeLineItem, GlLineItem} from '../../models/line-item/line-item-model';
import {InvoiceLockService} from '../../services/invoice-lock-service';
import {WebSocketService} from '../../services/web-socket-service';
import {EnvironmentService} from '../../services/environment-service/environment-service';


@Component({
  selector: 'app-invoice-edit-page',
  templateUrl: './invoice-edit-page.component.html',
  styleUrls: ['./invoice-edit-page.component.scss']
})
export class InvoiceEditPageComponent implements OnInit, OnDestroy {

  constructor(private util: UtilService,
              private modalService: ModalService,
              private route: ActivatedRoute,
              private userService: UserService,
              private invoiceService: InvoiceService,
              private invoiceLockService: InvoiceLockService,
              private toastService: ToastService,
              private rateService: RateService,
              @Inject(ATTACHMENT_SERVICE) private attachmentService: AttachmentService,
              private webSocketService: WebSocketService,
              private environmentService: EnvironmentService,
              public router: Router) {
    this.tripInformationFormGroup = new UntypedFormGroup({});
    this.invoiceAmountFormGroup = new UntypedFormGroup({});
    this.invoiceAllocationFormGroup = new UntypedFormGroup({});
    this.invoiceFormGroup = new UntypedFormGroup({
      tripInformation: this.tripInformationFormGroup,
      invoiceAmount: this.invoiceAmountFormGroup,
      invoiceAllocation: this.invoiceAllocationFormGroup
    });
  }

  breadcrumbs: Array<ElmLinkInterface> = [{label: 'All Invoices', path: `/invoices`}];
  public falconInvoiceNumber = '';
  public invoiceStatus = '';
  public isInvoiceLocked = false;
  public invoiceLockedUser = '';
  public milestones: Array<Milestone> = [];
  public userInfo: UserInfoModel | undefined;
  public isDeletedInvoice = false;
  public isApprovedInvoice = false;
  public isMilestoneTabOpen = false;
  public isAutoInvoice = false;
  public isEditableInvoice = true;
  public showMilestoneToggleButton = true;
  public invoiceFormGroup: UntypedFormGroup;
  public tripInformationFormGroup: UntypedFormGroup;
  public invoiceAmountFormGroup: UntypedFormGroup;
  public invoiceAllocationFormGroup: UntypedFormGroup;

  public isGlobalEditMode$ = new SubjectValue<boolean>(false);
  public isTripEditMode$ = new SubjectValue<boolean>(false);
  public otherSectionEditMode$ = new SubjectValue<boolean>(false);
  public loadTripInformation$ = new Subject<TripInformation>();
  public loadInvoiceOverviewDetail$ = new Subject<InvoiceOverviewDetail>();
  public loadInvoiceAmountDetail$ = new Subject<InvoiceAmountDetail>();
  public loadAllocationDetails$ = new Subject<InvoiceAllocationDetail>();
  public chargeLineItemOptions$ = new Subject<RateDetailResponse>();

  public standardPaymentTermsOverrideValid = true;

  private readonly requiredPermissions = [ElmUamPermission.ALLOW_INVOICE_WRITE];
  private readonly requiredRoles = ['FAL_INTERNAL_NONPROD_ALL_ACCESS', 'FAL_INTERNAL_WRITE'];

  public invoice: InvoiceDataModel = new InvoiceDataModel();
  public hasInvoiceWrite = false;
  public hasInvoiceWriteOrAll = false;
  public showEditInfoBanner = false;
  public showInvoiceInEditMode = false;
  @ViewChild(TripInformationComponent) tripInformationComponent!: TripInformationComponent;

  INVOICE_AMOUNT_CL = 'invoice-amount-cl';
  INVOICE_AMOUNT_PAYTERM = 'invoice-amount-pt';
  INVOICE_ALLOCATION_FORM = 'invoice-allocation';
  public costBreakdownValid = true;
  public netAllocationAmountValid = true;

  private rateCallCounter = 0;

  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.paramMap.subscribe(p => this.handleRouteParams(p))
    );
    this.subscriptions.add(
      this.userService.getUserInfo().subscribe(u => this.loadUserInfo(u))
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private handleRouteParams(params: ParamMap): void {
    this.falconInvoiceNumber = params.get('falconInvoiceNumber') ?? '';
    this.fetchFalconInvoice();
  }

  private fetchFalconInvoice(): void {
    if (this.falconInvoiceNumber) {
      this.subscriptions.add(
        this.invoiceService.getInvoice(this.falconInvoiceNumber)
          .subscribe(i => this.loadInvoice(i, true))
      );
    }
  }

  public loadInvoice(invoice: InvoiceDataModel, freshData = false): void {
    if (!freshData) {
      invoice.costLineItems?.forEach((item, index) => {
        let found;
        if (item.chargeCode === 'OTHER') {
          found = this.invoice.costLineItems.filter((i) => (
            i.chargeCode === item.chargeCode &&
            i.responseComment === item.responseComment &&
            i.chargeLineTotal === item.chargeLineTotal
          ));
        } else {
          found = this.invoice.costLineItems.filter((i) => i.chargeCode === item.chargeCode);
        }

        if (found.length > 0) {
          item.persisted = found[0].persisted;
        } else {
          // If for some reason an existing CostLineItem isn't found set it to persisted so that the delete modal pops up
          item.persisted = true;
        }
      });
    }

    this.invoice = invoice;
    this.milestones = invoice.milestones;
    this.isDeletedInvoice = StatusUtil.isDeleted(invoice.status);
    this.isApprovedInvoice = StatusUtil.isApproved(invoice.status);
    this.isEditableInvoice = StatusUtil.isEditable(invoice.status);
    this.isAutoInvoice = invoice.entryType === EntryType.AUTO;
    this.invoiceStatus = invoice.status.label;
    if (this.tripInformationFormGroup.disabled) {
      this.tripInformationFormGroup.enable();
    }
    this.loadTripInformation$.next({
      tripId: invoice.tripId,
      vendorNumber: invoice.vendorNumber ?? undefined,
      invoiceDate: new Date(invoice.invoiceDate),
      pickUpDate: invoice.pickupDateTime ? new Date(invoice.pickupDateTime) : undefined,
      createdDate: invoice.createdDate ? new Date(invoice.createdDate) : undefined,
      deliveryDate: invoice.deliveryDateTime ? new Date(invoice.deliveryDateTime) : undefined,
      proTrackingNumber: invoice.proNumber ? invoice.proNumber : 'N/A',
      bolNumber: invoice.billOfLadingNumber ? invoice.billOfLadingNumber : 'N/A',
      isBolNumberDuplicate: invoice.isBillOfLadingNumberDuplicate,
      duplicateBOLErrorMessage: invoice.duplicateBOLErrorMessage,
      freightPaymentTerms: invoice.freightPaymentTerms as FreightPaymentTerms,
      destinationType: invoice.destinationType,
      businessUnit: invoice.businessUnit,
      originAddress: {...invoice.origin, shippingPoint: invoice.shippingPoint},
      destinationAddress: {...invoice.destination, shippingPoint: invoice.shippingPoint},
      billToAddress: {...invoice.billTo},
      serviceLevel: invoice.serviceLevel,
      carrier: invoice.carrier,
      carrierMode: invoice.mode,
      freightOrders: invoice.freightOrders,
      overriddenDeliveryDateTime: invoice.overriddenDeliveryDateTime ? new Date(invoice.overriddenDeliveryDateTime) : undefined,
      assumedDeliveryDateTime: invoice.assumedDeliveryDateTime ? new Date(invoice.assumedDeliveryDateTime) : undefined,
      tripTenderTime: invoice.tripTenderTime ? new Date(invoice.tripTenderTime) : undefined,
      totalGrossWeight: invoice.totalGrossWeight ? invoice.totalGrossWeight : 0,
      originalTotalGrossWeight: invoice.originalTotalGrossWeight ?? 0,
      weightAdjustments: invoice.weightAdjustments ?? [],
    });
    if (this.tripInformationFormGroup.enabled) {
      this.tripInformationFormGroup.disable();
    }
    this.loadInvoiceOverviewDetail$.next({
      invoiceNetAmount: invoice.amountOfInvoice ? parseFloat(invoice.amountOfInvoice) : 0.0,
      invoiceDate: new Date(invoice.invoiceDate),
      businessUnit: invoice.businessUnit,
      billToAddress: invoice.billTo,
      paymentDue: new Date(invoice.paymentDue),
      carrier: `${invoice.carrier?.scac} (${invoice.carrier?.name})`,
      carrierMode: `${invoice.mode?.reportKeyMode} (${invoice.mode?.reportModeDescription})`,
      freightPaymentTerms: invoice.freightPaymentTerms,
      remitHistory: invoice.remitHistory,
      isSpotQuote: invoice.isSpotQuotePresent,
      returnToDomicile: invoice.returnToDomicile
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
      standardPaymentTermsOverride: invoice.standardPaymentTermsOverride,
      returnToDomicile: invoice.returnToDomicile
    });

    this.loadAllocationDetails$.next({
      totalGlAmount: invoice.totalGlAmount,
      invoiceNetAmount: invoice.amountOfInvoice,
      glLineItems: invoice.glLineItems,
      glLineItemsErrors: this.invoice.glLineItemsErrors,
      glLineItemsInvalid: this.invoice.glLineItemsInvalid
    });
  }

  private async loadUserInfo(newUserInfo: UserInfoModel): Promise<void> {
    const userInfo = new UserInfoModel(newUserInfo);
    await this.invoiceLockService.retrieveInvoiceLock(this.falconInvoiceNumber).toPromise();
    const lock = this.invoiceLockService.getInvoiceLock();

    if (lock !== null && !lock.currentUser) {
      this.showInvoiceInEditMode = true;
      this.isInvoiceLocked = true;
      this.invoiceLockedUser = lock.fullName;
    }
    this.userInfo = userInfo;
    this.hasInvoiceWrite = this.userInfo.hasAtLeastOnePermission(this.requiredPermissions);
    this.hasInvoiceWriteOrAll = this.userInfo.hasRoles(this.requiredRoles);
    if (this.environmentService.showFeature('websockets')) {
      this.webSocketService.connect(`/user/${this.userInfo.email}/queue/notification`);
    }
  }

  clickDeleteButton(): void {
    const modalData: ConfirmationModalData = {
      title: 'Delete Invoice',
      innerHtmlMessage: `Are you sure you want to delete this invoice?
               <br/><br/><strong>This action cannot be undone.</strong>`,
      confirmButtonText: 'Delete Invoice',
      cancelButtonText: 'Cancel'
    };
    this.util.openCommentModal({
      ...modalData,
      commentSectionFieldName: 'Reason for Deletion',
      requireField: true,
      confirmButtonStyle: 'primary',
    }).subscribe((result: CommentModel) => {
      if (result) {
        this.deleteInvoiceWithReason({deletedReason: result.comment}).subscribe(
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

  clickCloseBanner(): void {
    this.showEditInfoBanner = false;
    this.showInvoiceInEditMode = false;
  }



  clickToggleEditMode(): void {
    if (this.invoice.isSpotQuotePresent) {
      this.confirmSpotQuote().subscribe(result => {
        if (result) {
          this.toggleEditMode();

        }
      });
    } else {
      this.toggleEditMode();
    }
  }

  private toggleEditMode(): void {
    this.isGlobalEditMode$.value = !this.isGlobalEditMode$.value;
    this.isTripEditMode$.value = true;
    this.showEditInfoBanner = this.isGlobalEditMode$.value;
    this.otherSectionEditMode$.value = true;
    this.invoiceFormGroup.markAsPristine();
    this.invoiceLockService.createInvoiceLock(this.falconInvoiceNumber);
  }

  public confirmSpotQuote(): Observable<boolean> {
    return this.util.openConfirmationModal({
      title: 'Warning!  Spot Quote',
      innerHtmlMessage: `This is an invoice with Spot Quote.
                   Are you sure you want to continue to Edit?
                  `,
      confirmButtonText: 'YES, CONTINUE',
      cancelButtonText: 'CANCEL'
    });
  }

  clickToggleMilestoneTab(): void {
    this.isMilestoneTabOpen = !this.isMilestoneTabOpen;
  }

  handleAmountComponentIfInvalid($event: any) {
    if (($event.form === this.INVOICE_AMOUNT_CL || $event.form === this.INVOICE_AMOUNT_PAYTERM) && $event?.value) {
      this.costBreakdownValid = $event.value;
      this.standardPaymentTermsOverrideValid = $event.value;
    } else {
      this.costBreakdownValid = false;
      this.standardPaymentTermsOverrideValid = false;
    }
  }

  handleAllocationComponentIfInvalid($event: any) {
    if ($event.form === this.INVOICE_ALLOCATION_FORM) {
      this.netAllocationAmountValid = $event.value;
    }
  }

  reloadPage(){
    this.fetchFalconInvoice();
  }

  public askForCancelConfirmation(): Observable<boolean> {
    return this.util.openConfirmationModal({
      title: 'Cancel',
      innerHtmlMessage: `All changes to this invoice will be lost if you cancel now.

                   Are you sure you want to cancel?
                  `,
      confirmButtonText: 'Yes cancel',
      cancelButtonText: 'No go back'
    });
  }

  clickCancelButton(): void {
    if (this.isGlobalEditMode$.value && this.invoiceFormGroup.dirty) {
      this.askForCancelConfirmation().subscribe(result => {
        if (result) {
          this.fetchFalconInvoice();
          this.resetInvoiceForm();
        }
      });
    } else {
      this.fetchFalconInvoice();
      this.resetInvoiceForm();
    }
  }

  private resetInvoiceForm(): void {
    this.isGlobalEditMode$.value = false;
    this.showEditInfoBanner = this.isGlobalEditMode$.value;
    this.isTripEditMode$.value = false;
    this.otherSectionEditMode$.value = false;
    this.invoiceAmountFormGroup.get('fileFormGroup')?.reset();
    this.invoiceLockService.releaseInvoiceLock();
    this.invoiceLockService.invoiceLock = null;
  }

  handleTripEditModeEvent($event: any): void {
    if ($event && $event.event == 'update' && $event.value) {
      this.updateAndGetRates();
      this.otherSectionEditMode$.value = true;
    } else if ($event && $event.event == 'cancel' && !$event.value) {
      this.otherSectionEditMode$.value = true;
    } else if ($event && $event.event == 'edit' && !$event.value) {
      this.otherSectionEditMode$.value = false;
    }
  }

  async handleRefreshMasterDataEvent(): Promise<void> {
    const refreshedInvoice = await this.invoiceService.refreshMasterData(this.invoice).pipe(first()).toPromise();
    if (refreshedInvoice.refreshMasterDataStatus === 'REFRESHED') {
      this.toastService.openSuccessToast('Success. Master data has successfully been updated.');
      this.loadInvoice(refreshedInvoice);
    } else if (refreshedInvoice.refreshMasterDataStatus === 'LOOKUP_ERROR') {
      this.toastService.openErrorToast('Master data update failed due to invoice field not found in master data.');
    } else if ((refreshedInvoice.refreshMasterDataStatus === 'NOT_REFRESHED')) {
      this.toastService.openWarningToast('No master data updates needed for vendor number, business unit, customer category.');
    } else {
      this.toastService.openErrorToast('Unknown master data update status. ');
    }
  }

  async handleWeightAdjustmentModalEvent(currentWeight: number): Promise<void> {
    // await response from modal
    const result = await this.util.openWeightAdjustmentModal({currentWeight})
      .pipe(first()).toPromise();
    if (result) {
      this.updateInvoiceFromForms();
      // await response from backend
      const adjustedInvoice = await this.rateService.adjustWeightOnInvoice(this.invoice, result.adjustedWeight)
        .pipe(first()).toPromise();
      this.toastService.openSuccessToast('Success. Invoice weight has been adjusted.');
      // reload the invoice
      this.loadInvoice(adjustedInvoice);
    }
  }

  async handleEditGlLineItem(glLineItem: GlLineItem): Promise<void> {
    const glLineItems: any = JSON.parse(JSON.stringify(this.invoiceFormGroup.value.invoiceAllocation.invoiceAllocations));
    const updatedGlLineItems: any = await this.util.openGlLineItemModal({
      glLineItem,
      glLineItems
    }).pipe(first()).toPromise();
    if (updatedGlLineItems) {
      updatedGlLineItems.map((lineItem: any) => {
        lineItem.glAmount = lineItem.allocationAmount;
      });
      this.invoice.glLineItems = updatedGlLineItems;
      this.loadInvoice(this.invoice);
    }
  }

  clickSaveButton(): void {
    if (this.invoiceFormGroup.valid && this.tripInformationComponent.carrierDetailFound) {
      this.subscriptions.add(
        this.updateInvoice().subscribe(
          (value) => {
            if (!value.glLineItemsInvalid) {
              this.performPostUpdateActions(`Success! Falcon Invoice ${this.falconInvoiceNumber} has been updated.`);
              this.resetInvoiceForm();
            } else {
              this.toastService.openErrorToast('The Invoice Allocations line items have values which do not match with master data.');
              this.subscriptions.add(
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
    const editInvoiceModel = this.mapTripInformationToEditAutoInvoiceModel();

    const files: Array<File> = [];
    const uids: Array<string> = [];

    editInvoiceModel.costLineItems?.map((lineItem) => {
      const file = this.invoiceAmountFormGroup.get('fileFormGroup')?.get(lineItem.uid)?.value;
      if (file) {
        files.push(file);
        uids.push(lineItem.uid);
      }
    });

    const returnedInvoice = this.invoiceService.updateAutoInvoice(editInvoiceModel, this.falconInvoiceNumber);

    if (files.length && uids.length) {
      returnedInvoice.subscribe((updatedInvoice) => {
        this.attachmentService.saveAccessorialAttachments(this.falconInvoiceNumber, uids, files).subscribe((success) => {
            if (!success) {
              this.toastService.openErrorToast('Attachments failed to upload');
            }
            // Need page refreshed with new attachment links.
            this.invoiceService.getInvoice(this.falconInvoiceNumber).subscribe((invoice) => {
              this.loadInvoice(invoice);
            });

          }
        );
      });
    }
    return returnedInvoice;
  }

  clickSubmitForApprovalButton(): void {
    const paymentTermsOverridenValue = this.invoiceAmountFormGroup.controls.overridePaymentTerms?.value?.isPaymentOverrideSelected ?? [];

    if (paymentTermsOverridenValue.length > 0) {
      this.performSubmitAction();
    } else {
      this.util.openConfirmationModal({
        title: 'OOPS!',
        innerHtmlMessage: 'Override Standard Payment Terms has not been checked. Would you like to continue?',
        confirmButtonText: 'Yes, Continue',
        cancelButtonText: 'Cancel'
      }).subscribe((result: boolean) => {
        if (result) {
          this.performSubmitAction();
        }
      });
    }
  }

  performSubmitAction(): void {
    if (this.invoiceFormGroup.valid && this.tripInformationComponent.carrierDetailFound) {
      this.subscriptions.add(
        this.updateInvoice().pipe(
          switchMap((model: InvoiceDataModel) => {
            return this.invoiceService.submitForApproval(model.falconInvoiceNumber);
          })
        ).subscribe(
          (value) => {
            this.performPostUpdateActions(
              `Success! Falcon Invoice ${this.falconInvoiceNumber} has been updated and submitted for approval.`
            );
            this.resetInvoiceForm();
          },
          (error) => console.error(error)
        )
      );
    }
  }

  performPostUpdateActions(successMessage: string): void {
    window.scrollTo({top: 0, behavior: 'smooth'});
    this.ngOnInit();
    this.toggleEditMode();
    this.toastService.openSuccessToast(successMessage);
  }

  mapTripInformationToEditAutoInvoiceModel(): EditAutoInvoiceModel {
    const originAddressFormGroup = this.tripInformationFormGroup.controls.originAddress;
    const destinationAddressFormGroup = this.tripInformationFormGroup.controls.destinationAddress;
    const billToAddressFormGroup = this.tripInformationFormGroup.controls.billToAddress;
    const originLocation = LocationUtils.extractLocation(originAddressFormGroup, 'origin');
    const paymentTerms = this.invoiceAmountFormGroup.controls.overridePaymentTerms?.value ?? {};
    const paymentTermsOverridenValue = paymentTerms.isPaymentOverrideSelected && paymentTerms.isPaymentOverrideSelected.length > 0
    && paymentTerms.isPaymentOverrideSelected[0] === 'override' && paymentTerms.paymentTerms ? paymentTerms.paymentTerms : undefined;

    return {
      amountOfInvoice: this.invoiceAmountFormGroup.controls.amountOfInvoice.value,
      totalGrossWeight: this.tripInformationFormGroup.controls.totalGrossWeight.value,
      originalTotalGrossWeight: this.tripInformationFormGroup.controls.originalTotalGrossWeight.value,
      weightAdjustments: this.invoice.weightAdjustments ?? [],
      freightOrders: this.tripInformationFormGroup.controls.freightOrders.value,
      costLineItems: this.getLineItems(this.invoiceAmountFormGroup.controls.costBreakdownItems),
      pendingChargeLineItems: this.getLineItems(this.invoiceAmountFormGroup.controls.pendingChargeLineItems),
      disputeLineItems: this.getDisputeLineItems(this.invoiceAmountFormGroup.controls.disputeLineItems),
      deniedChargeLineItems: this.getLineItems(this.invoiceAmountFormGroup.controls.deniedChargeLineItems),
      deletedChargeLineItems: this.getLineItems(this.invoiceAmountFormGroup.controls.deletedChargeLineItems),
      hasRateEngineError: this.invoice.hasRateEngineError,
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
        level: this.tripInformationFormGroup.controls.serviceLevel.value?.level ??
          this.tripInformationFormGroup.controls.serviceLevel.value,
        name: this.invoice.serviceCode
      },
      pickupDateTime: this.tripInformationFormGroup.controls.pickUpDate.value,
      glLineItemList: this.invoiceAllocationFormGroup.controls.invoiceAllocations.value,
      originAddress: originLocation,
      destinationAddress: LocationUtils.extractLocation(destinationAddressFormGroup, 'destination', this.invoice?.destination?.code),
      billToAddress: BillToLocationUtils.extractBillToLocation(billToAddressFormGroup),
      shippingPoint: originLocation.code,
      businessUnit: this.invoice.businessUnit,
      standardPaymentTermsOverride: paymentTermsOverridenValue,
      billOfLadingNumber: CommonUtils.handleNAValues(this.invoice.billOfLadingNumber),
      currency: this.invoiceAmountFormGroup.controls.currency.value,
      payable: this.invoice.payable
    };
  }

  updateInvoiceFromForms(): void {
    this.invoice.pickupDateTime = this.tripInformationFormGroup.controls.pickUpDate?.value;
    this.invoice.serviceLevel = this.tripInformationFormGroup.controls.serviceLevel?.value?.level ??
      this.tripInformationFormGroup.controls.serviceLevel?.value;
    this.invoice.serviceCode = this.tripInformationFormGroup.controls.serviceLevel?.value?.name ??
      this.tripInformationFormGroup.controls.serviceLevel?.value;
    this.invoice.mode = this.tripInformationFormGroup.controls.carrierMode?.value;
    this.invoice.carrier = this.tripInformationFormGroup.controls.carrier?.value;
    this.invoice.billOfLadingNumber = this.tripInformationFormGroup.controls.bolNumber?.value;
    const originAddressFormGroup = this.tripInformationFormGroup.controls.originAddress as UntypedFormGroup;
    this.invoice.origin = LocationUtils.extractLocation(originAddressFormGroup, 'origin');
    const destinationAddressFormGroup = this.tripInformationFormGroup.controls.destinationAddress as UntypedFormGroup;
    this.invoice.destination = LocationUtils.extractLocation(destinationAddressFormGroup, 'destination', this.invoice.destination.code);
    const billToAddressFormGroup = this.tripInformationFormGroup.controls.billToAddress as UntypedFormGroup;
    this.invoice.billTo = BillToLocationUtils.extractBillToLocation(billToAddressFormGroup);
    this.invoice.costLineItems = this.getLineItems(this.invoiceAmountFormGroup.controls.costBreakdownItems);
    this.invoice.pendingChargeLineItems = this.getLineItems(this.invoiceAmountFormGroup.controls.pendingChargeLineItems);
    this.invoice.shippingPoint = CommonUtils.handleNAValues(originAddressFormGroup.controls.shippingPoint?.value);
    this.invoice.amountOfInvoice = this.invoiceAmountFormGroup.controls.amountOfInvoice?.value;
    this.invoice.deletedChargeLineItems = this.getLineItems(this.invoiceAmountFormGroup.controls.deletedChargeLineItems);
    this.invoice.deniedChargeLineItems = this.getLineItems(this.invoiceAmountFormGroup.controls.deniedChargeLineItems);
    this.invoice.disputeLineItems = this.getDisputeLineItems(this.invoiceAmountFormGroup.controls.disputeLineItems);
    this.invoice.glLineItems = this.invoiceAllocationFormGroup.controls.invoiceAllocations.value;
    this.invoice.vendorNumber = this.tripInformationFormGroup.controls.vendorNumber?.value;
    const paymentTerms = this.invoiceAmountFormGroup.controls.overridePaymentTerms?.value ?? {};
    this.invoice.standardPaymentTermsOverride = paymentTerms.isPaymentOverrideSelected && paymentTerms.isPaymentOverrideSelected.length > 0
    && paymentTerms.isPaymentOverrideSelected[0] === 'override' && paymentTerms.paymentTerms ? paymentTerms.paymentTerms : undefined;
  }

  getDisputeLineItems(items: AbstractControl): Array<DisputeLineItem> {
    const results: Array<DisputeLineItem> = [];
    const lineItems = items as UntypedFormArray;
    if (!lineItems?.controls) {
      return [];
    }
    for (const control of lineItems.controls) {
      const item = control as UntypedFormGroup;
      results.push({

        comment: CommonUtils.handleNAValues(item.controls?.comment?.value),
        attachment: CommonUtils.handleNAValues(item.controls?.attachment?.value),
        createdDate: CommonUtils.handleNAValues(item.controls?.createdDate?.value),
        createdBy: CommonUtils.handleNAValues(item.controls?.createdBy?.value),
        disputeStatus: {
          key: CommonUtils.handleNAValues(item.controls?.disputeStatus?.value?.key),
          label: CommonUtils.handleNAValues(item.controls?.disputeStatus?.value?.label)
        },
        responseComment: CommonUtils.handleNAValues(item.controls?.responseComment?.value),
        closedDate: CommonUtils.handleNAValues(item.controls?.closedDate?.value),
        closedBy: CommonUtils.handleNAValues(item.controls?.closedBy?.value)

      });
    }
    return results;
  }

  getLineItems(items: AbstractControl): Array<CostLineItem> {
    const results: Array<CostLineItem> = [];
    const lineItems = items as UntypedFormArray;
    if (!lineItems?.controls) {
      return [];

    }
    for (const control of lineItems.controls) {
      const item = control as UntypedFormGroup;
      results.push({
        uid: CommonUtils.handleNAValues(item.controls?.uid?.value),
        accessorialCode: CommonUtils.handleNAValues(item.controls?.accessorialCode?.value),
        chargeCode: CommonUtils.handleNAValues(item.controls?.charge?.value),
        attachment: CommonUtils.handleNAValues(item.controls?.attachment?.value),
        attachmentRequired: CommonUtils.handleNAValues(item.controls?.attachmentRequired?.value),
        attachmentLink: CommonUtils.handleNAValues(item.controls?.attachmentLink?.value),
        autoApproved: CommonUtils.handleNAValues(item.controls?.autoApproved?.value),
        carrierComment: CommonUtils.handleNAValues(item.controls?.carrierComment?.value),
        chargeLineTotal: CommonUtils.handleNAValues(item.controls?.totalAmount?.value),
        closedBy: CommonUtils.handleNAValues(item.controls?.closedBy?.value),
        closedDate: CommonUtils.handleNAValues(item.controls?.closedDate?.value),
        costName: '',
        createdBy: CommonUtils.handleNAValues(item.controls?.createdBy?.value),
        createdDate: CommonUtils.handleNAValues(item.controls?.createdDate?.value),
        entrySource: CommonUtils.handleNAValues(item.controls?.entrySourcePair?.value),
        expanded: false,
        fuel: CommonUtils.handleNAValues(item.controls?.fuel?.value),
        manual: CommonUtils.handleNAValues(item.controls?.manual?.value),
        message: CommonUtils.handleNAValues(item.controls?.message?.value),
        planned: CommonUtils.handleNAValues(item.controls?.planned?.value),
        quantity: CommonUtils.handleNAValues(item.controls?.quantity?.value),
        rateAmount: CommonUtils.handleNAValues(item.controls?.rate?.value),
        rateResponse: CommonUtils.handleNAValues(item.controls?.rateResponse?.value),
        rateSource: CommonUtils.handleNAValues(item.controls?.rateSourcePair?.value),
        rateType: CommonUtils.handleNAValues(item.controls?.type?.value),
        requestStatus: CommonUtils.handleNAValues(item.controls?.requestStatusPair?.value),
        responseComment: CommonUtils.handleNAValues(item.controls?.responseComment?.value),
        lineItemType: CommonUtils.handleNAValues(item.controls?.lineItemType?.value),
        variables: item.controls?.variables?.value ?? [],
        deletedDate: item.controls?.deletedDate?.value,
        persisted: item.controls?.persisted?.value,
      });
    }
    return results;
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
    if (this.invoice.isSpotQuotePresent ||this.checkAccessorialData(this.invoice)) {
      const request: RateEngineRequest = this.createRequest('');
      this.subscriptions.add(
        this.rateService.getAccessorialDetails(request).subscribe(result => this.chargeLineItemOptions$.next(result))
      );
    }
  }

  updateAndGetRates(): void {
    this.updateInvoiceFromForms();
    if (this.checkAccessorialData(this.invoice)) {
      this.rateCallCounter++;
      this.rateService.updateInvoice(this.invoice).subscribe(
        (invoice: any) => this.loadReRate(invoice),
        (error) => this.showErrorReRate(error)
      );
    }
  }

  /**
   *  Retrieves the rate for a provided accessorial code.
   *  Populates the line item information for the selected accessorial code.
   *  Rate management is not called if checkAccessorialData() returns false,indicating required data is missing.
   */
  getRates(): void {
    this.updateInvoiceFromForms();
    if (this.invoice.isSpotQuotePresent || (this.checkAccessorialData(this.invoice))) {
      this.rateCallCounter++;
      this.rateService.rateInvoice(this.invoice).subscribe(
        ratedInvoiced => this.loadReRate(ratedInvoiced),
        error => this.showErrorReRate(error)
      );
    }

  }

  loadReRate(invoice: InvoiceDataModel): void {
    this.loadInvoice(invoice);
    if (!invoice.isSpotQuotePresent) {
      if (invoice.isBillOfLadingNumberDuplicate) {
        this.toastService.openErrorToast('The BOL number already exists on another invoice.');
      } else if (invoice.hasRateEngineError) {
        this.toastService.openErrorToast('There were errors while attempting to re-rate.');
      } else {
        this.toastService.openSuccessToast('Success. Invoice charges have been re-rated.');
      }
    }
    this.rateCallCounter--;
  }

  showErrorReRate(error: any): void {
    const errorMessage = error.error.error.message;
    this.toastService.openErrorToast(errorMessage);
    this.rateCallCounter--;
  }

  public get isMakingRateCall(): boolean {
    return this.rateCallCounter > 0;
  }

  onGlAllocationRequestEvent(request: boolean): void {
    if (!request) {
      return;
    }
    this.updateInvoiceFromForms();
    this.rateService.glAllocateInvoice(this.invoice).subscribe(
      glAllocatedInvoice => {
        this.toastService.openSuccessToast('Success. Invoice GL Lines have been re-allocated.');
        this.loadInvoice(glAllocatedInvoice);
      }
    );
  }

  viewHistoryLog(): void {
    this.util.openHistoryLog(this.invoice);
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
    this.subscriptions.add(this.modalService.openSystemErrorModal({
      title, innerHtmlMessage: 'Not Yet Implemented On This Page'
    }).subscribe());
  }

  private deleteInvoiceWithReason(deletedReasonParameters: any): Observable<any> {
    return this.invoiceService.deleteInvoiceWithReason(this.falconInvoiceNumber, deletedReasonParameters);
  }

  get isSaveButtonDisabled(): boolean {
    return this.invoice.hasRateEngineError
      || !this.otherSectionEditMode$.value
      || !this.invoiceFormGroup.valid
      || !this.tripInformationComponent.carrierDetailFound
      || ((!this.costBreakdownValid
          || !this.netAllocationAmountValid
          || !this.standardPaymentTermsOverrideValid)
        && this.invoice.payable);
  }

  get isSubmitForApprovalButtonDisabled(): boolean {
    return this.invoice.hasRateEngineError
      || !this.invoice.payable
      || !this.otherSectionEditMode$.value
      || !this.invoiceFormGroup.valid
      || !this.tripInformationComponent.carrierDetailFound
      || !this.costBreakdownValid
      || !this.netAllocationAmountValid
      || !this.standardPaymentTermsOverrideValid;
  }
}

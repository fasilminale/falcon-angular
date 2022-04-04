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
import {WebServices} from '../../services/web-services';
import {RateEngineRequest, RateEngineResponse} from '../../models/rate-engine/rate-engine-request';
import {environment} from '../../../environments/environment';
import {FreightOrder} from '../../models/invoice/freight-model';


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
  public isRejectedInvoice = false;
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
  public chargeLineItemOptions$ = new Subject<RateEngineResponse>();

  private readonly requiredPermissions = [ElmUamRoles.ALLOW_INVOICE_WRITE];
  private invoice: InvoiceDataModel = new InvoiceDataModel();
  public hasInvoiceWrite = false;

  constructor(private util: UtilService,
              private route: ActivatedRoute,
              private userService: UserService,
              private invoiceService: InvoiceService,
              private toastService: ToastService,
              private webService: WebServices,
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
    this.subscriptions.manage(
      this.getAccessorialList(invoice).subscribe(result => this.chargeLineItemOptions$.next(result))
    );
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

  getAccessorialList(invoice: InvoiceDataModel): Observable<RateEngineResponse> {
    if (this.checkAccessorialData(invoice)) {
      const request: RateEngineRequest = {
        mode: invoice.mode.mode,
        scac: invoice.carrier.scac,
        shipDate: invoice.pickupDateTime,
        origin: {
          streetAddress: invoice.origin.address,
          locCode: '',
          city: invoice.origin.city,
          state: invoice.origin.state,
          zip: invoice.origin.zipCode,
          country: invoice.origin.country
        },
        destination: {
          streetAddress: invoice.destination.address,
          locCode: '',
          city: invoice.destination.city,
          state: invoice.destination.state,
          zip: invoice.destination.zipCode,
          country: invoice.destination.country
        },
        accessorialCodes: [],
        invoice: this.invoice
      };
      return this.webService.httpPost(`${environment.baseServiceUrl}/v1/rates/getAccessorialDetails`, request);
    }
    return of();
  }

  getRates(event: any): any {
    if (event) {
      const origin = this.tripInformationFormGroup.get('originAddress');
      const destination = this.tripInformationFormGroup.get('destinationAddress');
      const request: RateEngineRequest = {
        mode: this.tripInformationFormGroup.get('carrierMode')?.value.mode,
        scac: this.tripInformationFormGroup.get('carrier')?.value.scac,
        shipDate: this.tripInformationFormGroup.get('pickUpDate')?.value,
        origin: {
          streetAddress: origin?.get('address')?.value,
          locCode: '',
          city: origin?.get('city')?.value,
          state: origin?.get('state')?.value,
          zip: origin?.get('zipCode')?.value,
          country: origin?.get('country')?.value
        },
        destination: {
          streetAddress: destination?.get('address')?.value,
          locCode: '',
          city: destination?.get('city')?.value,
          state: destination?.get('state')?.value,
          zip: destination?.get('zipCode')?.value,
          country: destination?.get('country')?.value
        },
        accessorialCodes: [event],
        invoice: this.invoice
      };

      return this.webService.httpPost(`${environment.baseServiceUrl}/v1/rates/getRates`, request).subscribe(res => res);
    }
    return of();
  }

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

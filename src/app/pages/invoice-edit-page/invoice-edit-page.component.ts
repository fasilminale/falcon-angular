import {Component, Inject, OnInit} from '@angular/core';
import {UtilService} from '../../services/util-service';
import {Milestone} from '../../models/milestone/milestone-model';
import {FormGroup} from '@angular/forms';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {SUBSCRIPTION_MANAGER, SubscriptionManager} from '../../services/subscription-manager';
import {UserService} from '../../services/user-service';
import {InvoiceService} from '../../services/invoice-service';
import {Subject} from 'rxjs';
import {EntryType, InvoiceDataModel} from '../../models/invoice/invoice-model';
import {StatusUtil} from '../../models/invoice/status-model';
import {FreightPaymentTerms, TripInformation} from '../../models/invoice/trip-information-model';
import {SubjectValue} from '../../utils/subject-value';
import {FalUserInfo} from '../../models/user-info/user-info-model';
import { InvoiceOverviewDetail } from 'src/app/models/invoice/invoice-overview-detail.model';

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
  public isMilestoneTabOpen = false;
  public isAutoInvoice = false;
  public showMilestoneToggleButton = true;
  public invoiceFormGroup: FormGroup;
  public tripInformationFormGroup: FormGroup;
  public invoiceAmountFormGroup: FormGroup;

  public isEditMode$ = new SubjectValue(false);
  public loadTripInformation$ = new Subject<TripInformation>();
  public loadInvoiceOverviewDetail$ = new Subject<InvoiceOverviewDetail>();

  constructor(private util: UtilService,
              private router: Router,
              private route: ActivatedRoute,
              private userService: UserService,
              private invoiceService: InvoiceService,
              @Inject(SUBSCRIPTION_MANAGER) private subscriptions: SubscriptionManager) {
    this.tripInformationFormGroup = new FormGroup({});
    this.invoiceAmountFormGroup = new FormGroup({});
    this.invoiceFormGroup = new FormGroup({
      tripInformation: this.tripInformationFormGroup,
      invoiceAmount: this.invoiceAmountFormGroup
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
          .subscribe(i  => this.loadInvoice(i))
      );
    }
  }

  private loadInvoice(invoice: InvoiceDataModel): void {
    this.milestones = invoice.milestones;
    this.isDeletedInvoice = StatusUtil.isDeleted(invoice.status);
    this.isSubmittedInvoice = StatusUtil.isSubmitted(invoice.status);
    this.isAutoInvoice = invoice.entryType === EntryType.AUTO;
    this.invoiceStatus = invoice.status.label;
    this.loadTripInformation$.next({
      tripId: 'N/A',
      invoiceDate: new Date(invoice.invoiceDate),
      proTrackingNumber: 'N/A',
      bolNumber: 'N/A',
      freightPaymentTerms: FreightPaymentTerms.PREPAID,
    });
    this.loadInvoiceOverviewDetail$.next({
      invoiceNetAmount: 6600,
      invoiceDate: new Date(),
      businessUnit: 'GPSC',
      billToAddress: 'Customer Name, 2125 Chestnut St San Fransisco, CA 94123,United States',
      paymentDue: new Date(),
      carrier: 'Fedex',
      carrierMode: 'Air',
      freightPaymentTerms: FreightPaymentTerms.PREPAID,
      remittanceInformation: {
        erpInvoiceNumber: 'ERP1000',
  erpRemittanceNumber: 'ERP2000',
    vendorId: 'FED100',
    amountOfPayment: 600,
   
      }
    })
  }

  private loadUserInfo(newUserInfo: FalUserInfo): void {
    this.userInfo = newUserInfo;
  }

  clickSaveAsTemplateButton(): void {
    this.showNotYetImplementedModal('Save As Template');
  }

  clickDeleteButton(): void {
    this.showNotYetImplementedModal('Delete Invoice');
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
}

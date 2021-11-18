import {Component, Inject, OnInit} from '@angular/core';
import {UserInfo} from '@elm/elm-styleguide-ui';
import {UtilService} from '../../services/util-service';
import {Milestone} from '../../models/milestone/milestone-model';
import {FormGroup} from '@angular/forms';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {SUBSCRIPTION_MANAGER, SubscriptionManager} from '../../services/subscription-manager';
import {UserService} from '../../services/user-service';
import {InvoiceService} from '../../services/invoice-service';
import {Subject} from 'rxjs';
import {Invoice} from '../../models/invoice/invoice-model';
import {StatusUtil} from '../../models/invoice/status-model';
import {FreightPaymentTerms, TripInformation} from '../../models/invoice/trip-information-model';
import {SubjectValue} from '../../utils/subject-value';

@Component({
  selector: 'app-invoice-edit-page',
  templateUrl: './invoice-edit-page.component.html',
  styleUrls: ['./invoice-edit-page.component.scss']
})
export class InvoiceEditPageComponent implements OnInit {

  public falconInvoiceNumber = '';
  public invoiceStatus = '';
  public milestones: Array<Milestone> = [];
  public userInfo?: UserInfo;
  public isDeletedInvoice = false;
  public isSubmittedInvoice = false;
  public isMilestoneTabOpen = false;
  public showMilestoneToggleButton = true;
  public invoiceFormGroup: FormGroup;
  public tripInformationFormGroup: FormGroup;

  public isEditMode$ = new SubjectValue(false);
  public loadTripInformation$ = new Subject<TripInformation>();

  constructor(private util: UtilService,
              private route: ActivatedRoute,
              private userService: UserService,
              private invoiceService: InvoiceService,
              @Inject(SUBSCRIPTION_MANAGER) private subscriptions: SubscriptionManager) {
    this.tripInformationFormGroup = new FormGroup({});
    this.invoiceFormGroup = new FormGroup({
      tripInformation: this.tripInformationFormGroup
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

  private loadInvoice(invoice: Invoice): void {
    this.isDeletedInvoice = StatusUtil.isDeleted(invoice.status);
    this.isSubmittedInvoice = StatusUtil.isSubmitted(invoice.status);
    this.invoiceStatus = invoice.status.label;
    this.loadTripInformation$.next({
      tripId: 'N/A',
      invoiceDate: new Date(invoice.invoiceDate),
      proTrackingNumber: 'N/A',
      bolNumber: 'N/A',
      freightPaymentTerms: FreightPaymentTerms.PREPAID,
    });
  }

  private loadUserInfo(newUserInfo: UserInfo): void {
    this.userInfo = newUserInfo;
  }

  clickSaveAsTemplateButton(): void {
    this.showNotYetImplementedModal('Save As Template');
  }

  clickDeleteButton(): void {
    this.showNotYetImplementedModal('Delete Invoice');
  }

  clickEditButton(): void {
    this.isEditMode$.value = !this.isEditMode$.value;
  }

  clickMilestoneToggleButton(): void {
    this.isMilestoneTabOpen = !this.isMilestoneTabOpen;
  }

  private showNotYetImplementedModal(title: string): void {
    this.subscriptions.manage(this.util.openErrorModal({
      title, innerHtmlMessage: 'Not Yet Implemented On This Page'
    }).subscribe());
  }
}

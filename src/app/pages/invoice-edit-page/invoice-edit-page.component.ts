import {Component, Inject, OnInit} from '@angular/core';
import {UserInfo} from '@elm/elm-styleguide-ui';
import {UtilService} from '../../services/util-service';
import {Milestone} from '../../models/milestone/milestone-model';
import {FormGroup} from '@angular/forms';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {SUBSCRIPTION_MANAGER, SubscriptionManager} from '../../services/subscription-manager';
import {UserInfoModel} from '../../models/user-info/user-info-model';
import {UserService} from '../../services/user-service';
import {InvoiceService} from '../../services/invoice-service';
import {Subject} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {TripInformation} from './trip-information/trip-information.component';

@Component({
  selector: 'app-invoice-edit-page',
  templateUrl: './invoice-edit-page.component.html',
  styleUrls: ['./invoice-edit-page.component.scss']
})
export class InvoiceEditPageComponent implements OnInit {

  public falconInvoiceNumber = '';
  public invoiceStatus = 'Fake';
  public milestones: Array<Milestone> = [];
  public userInfo?: UserInfo;
  public isDeletedInvoice = false;
  public isSubmittedInvoice = false;
  public isEditMode = false;
  public isMilestoneTabOpen = false;
  public showMilestoneToggleButton = true;
  public invoiceFormGroup: FormGroup;
  public tripInformationFormGroup: FormGroup;

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
      this.userService.getUserInfo().subscribe(u => this.handleUserInfo(u))
    );
  }

  private handleRouteParams(params: ParamMap): void {
    this.falconInvoiceNumber = params.get('falconInvoiceNumber') ?? '';
    if (this.falconInvoiceNumber) {
      this.subscriptions.manage(
        this.invoiceService.getInvoice(this.falconInvoiceNumber)
          .subscribe(i => this.handleInvoice(i))
      );
    }
  }

  private handleInvoice(invoice: any): void {
    this.loadTripInformation$.next({
      tripId: 'N/A',
      invoiceDate: new Date(invoice.invoiceDate),
      pickUpDate: new Date(),
      deliveryDate: new Date(),
      proTrackingNumber: 'N/A',
      bolNumber: 'N/A',
      freightPaymentTerms: 'N/A',
      carrier: {name: 'N/A', scac: 'N/A'},
      carrierMode: {name: 'N/A', code: 'N/A'},
      serviceLevel: {name: 'N/A', code: 'N/A'}
    });
  }

  private handleUserInfo(newUserInfo: UserInfo): void {
    this.userInfo = newUserInfo;
  }

  async clickSaveAsTemplateButton(): Promise<void> {
    return this.showNotYetImplementedModal('Save As Template');
  }

  async clickDeleteButton(): Promise<void> {
    return this.showNotYetImplementedModal('Delete Invoice');
  }

  async clickEditButton(): Promise<void> {
    return this.showNotYetImplementedModal('Edit Switch');
  }

  async clickMilestoneToggleButton(): Promise<void> {
    this.isMilestoneTabOpen = !this.isMilestoneTabOpen;
  }

  private async showNotYetImplementedModal(title: string): Promise<void> {
    return this.util.openErrorModal({
      title, innerHtmlMessage: 'Not Yet Implemented On This Page'
    }).toPromise();
  }
}

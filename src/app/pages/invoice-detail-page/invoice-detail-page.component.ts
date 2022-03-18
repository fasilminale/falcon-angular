import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FalFileInputComponent} from '../../components/fal-file-input/fal-file-input.component';
import {ActivatedRoute, Router} from '@angular/router';
import {BreadcrumbInterface, ConfirmationModalComponent} from '@elm/elm-styleguide-ui';
import {MatDialog} from '@angular/material/dialog';
import {environment} from '../../../environments/environment';
import {WebServices} from '../../services/web-services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {InvoiceFormComponent} from '../../components/invoice-form/invoice-form.component';
import {Observable, Subject, Subscription} from 'rxjs';
import {TimeService} from '../../services/time-service';
import {Milestone} from '../../models/milestone/milestone-model';
import {KeyedLabel} from '../../models/generic/keyed-label';
import {UserInfoModel} from '../../models/user-info/user-info-model';
import {UserService} from '../../services/user-service';
import {ElmUamRoles} from '../../utils/elm-uam-roles';
import {UtilService} from '../../services/util-service';

@Component({
  selector: 'app-detail-create-page',
  templateUrl: './invoice-detail-page.component.html',
  styleUrls: ['./invoice-detail-page.component.scss']
})
export class InvoiceDetailPageComponent implements OnInit, OnDestroy {

  public readonly regex = /[a-zA-Z0-9_\\-]/;

  @ViewChild(FalFileInputComponent) fileChooserInput?: FalFileInputComponent;
  @ViewChild(InvoiceFormComponent) invoiceForm?: InvoiceFormComponent;

  breadcrumbs: Array<BreadcrumbInterface> = [{label: 'All Invoices', path: `/invoices`}];
  public userInfo: UserInfoModel | undefined;
  public readOnly = true;
  public milestonesTabOpen = false;
  public isDeletedInvoice = false;
  public isSubmittedInvoice = false;
  public isAutoInvoice = false;
  public isApprovedInvoice = false;
  public isRejectedInvoice = false;
  public falconInvoiceNumber = '';
  public milestones: Array<Milestone> = [];
  public invoiceStatus = '';

  private readonly requiredPermissions = [ElmUamRoles.ALLOW_INVOICE_WRITE];
  public hasInvoiceWrite = false;
  public onCancel$ = new Subject<any>();

  private subscriptions: Array<Subscription> = [];

  public constructor(private webService: WebServices,
                     private route: ActivatedRoute,
                     private dialog: MatDialog,
                     private snackBar: MatSnackBar,
                     private timeService: TimeService,
                     public router: Router,
                     public userService: UserService,
                     public util: UtilService) {
  }

  public ngOnInit(): void {
    this.subscriptions.push(
      this.route.paramMap.subscribe(params => {
        const newFalconInvoiceNumber = params.get('falconInvoiceNumber');
        this.falconInvoiceNumber = newFalconInvoiceNumber ? newFalconInvoiceNumber : '';
      })
    );
    this.userService.getUserInfo().subscribe(userInfo => {
      this.userInfo = new UserInfoModel(userInfo);
      this.hasInvoiceWrite = this.userInfo.hasPermission(this.requiredPermissions);
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public invoiceStatusChange(status: KeyedLabel | null): void {
    this.invoiceStatus = status?.label ?? '';
  }

  public updateMilestones(milestones: Array<Milestone>): void {
    milestones.sort((a, b) =>
      -this.timeService.compareTimestamps(a.timestamp, b.timestamp)
    );
    this.milestones = milestones;
  }

  public toggleMilestones(): void {
    this.milestonesTabOpen = !this.milestonesTabOpen;
  }

  public editInvoice(): void {
    this.readOnly = false;
  }

  public deleteInvoice(): void {
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
    dialogResult.subscribe(result => {
        if (result) {
          const request = this.requireDeleteReason()
            ? this.deleteInvoiceWithReason({deletedReason: result})
            : this.deleteInvoiceWithoutReason();
          request.subscribe(
              () => this.router.navigate(
                [`/invoices`],
                {queryParams: {falconInvoiceNumber: this.falconInvoiceNumber}}
              ),
              () => this.snackBar.open(
                `Failure, invoice was not deleted.`,
                'close',
                {duration: 5 * 1000}
              )
            );
        }
      });
  }

  public saveAsTemplate(): void {
    if (this.invoiceForm) {
      this.invoiceForm.saveTemplate();
    }
  }

  public disableInvoice(value: boolean): void {
    this.isDeletedInvoice = value;
  }

  public submittedInvoice(value: boolean): void {
    this.isSubmittedInvoice = value;
  }

  public autoInvoice(value: boolean): void {
    this.isAutoInvoice = value;
  }

  public approvedInvoice(value: boolean): void {
    this.isApprovedInvoice = value;
  }

  public rejectedInvoice(value: boolean): void {
    this.isRejectedInvoice = value;
  }

  public requireDeleteReason(): boolean {
    return this.isAutoInvoice && this.isApprovedInvoice;
  }

  private deleteInvoiceWithoutReason(): Observable<any> {
    return this.webService.httpDelete(`${environment.baseServiceUrl}/v1/invoice/${this.falconInvoiceNumber}`);
  }

  private deleteInvoiceWithReason(deletedReasonParameters: any): Observable<any> {
    return this.webService.httpPut(`${environment.baseServiceUrl}/v1/invoice/${this.falconInvoiceNumber}/delete`, deletedReasonParameters);
  }

  public formatTimestamp(value: string): string | undefined {
    return this.timeService.formatTimestamp(value, 'MM/DD/YY HH:mm z');
  }

  public breadcrumbNavigate(event: any): void {
    if (!this.readOnly) {
      this.onCancel$.next();
    } else {
      this.router.navigate([event]);
    }
  }
}

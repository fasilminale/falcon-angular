import {Component, EventEmitter, Input, Output} from '@angular/core';
import { ElmLinkInterface} from '@elm/elm-styleguide-ui/lib/components/data-table/data-table.component';
import {first} from 'rxjs/operators';
import {UtilService} from '../../services/util-service';
import {UserInfoModel} from '../../models/user-info/user-info-model';
import {UserService} from '../../services/user-service';
import {ElmUamPermission} from '../../utils/elm-uam-permission';
import {InvoiceLockService} from '../../services/invoice-lock-service';
import {EnvironmentService} from '../../services/environment-service/environment-service';
import {InvoiceService} from '../../services/invoice-service';

@Component({
  selector: 'fal-elm-page-header',
  templateUrl: './fal-page-header.component.html',
  styleUrls: ['./fal-page-header.component.scss']
})
export class FalPageHeaderComponent {
  public userInfo: UserInfoModel | undefined;
  private readonly requiredPermissions = [ElmUamPermission.ALLOW_EDIT_STATUS];

  constructor(private utilService: UtilService,
              private userService: UserService,
              private invoiceLockService: InvoiceLockService,
              private environmentService: EnvironmentService,
              private invoiceService: InvoiceService
              ) {
  }

  public enableStatusEditButton = false;
  public greyStatusEditButton = true;
  private isCurrentUser = false;

  @Input() headerTitle = '';
  @Input() headerTitleStyling?: string;
  @Input() headerSubtitle = '';
  @Input() headerSubtitleStyling?: string;
  @Input() margin = '0 -24px 24px';
  @Input() contentFlex: string | undefined;
  @Input() breadcrumbs: Array<ElmLinkInterface> = [];
  @Input() helpUrl = '';
  @Input() falconInvoiceNumber = '';
  @Input() isInGlobalEditMode:boolean = false;
  /**
   * Forces the help button to be visible when a helpUrl is not given.
   * Allows capture of helpRequested event.
   */
  @Input() forceHelpButton?: boolean;

  /**
   * Event emitted when the help button or help link is clicked.
   */
  @Output() helpRequested: EventEmitter<true> = new EventEmitter<true>();
  @Output("reloadPage") reloadPage: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {
    this.userService.getUserInfo().subscribe(u => this.loadUserInfo(u));
  }

  private async loadUserInfo(newUserInfo: UserInfoModel): Promise<void> {
    await this.environmentService.getFeatures();
    const isFeatureEnabled: boolean = this.environmentService.showFeature('editStatusEnabled');

    this.userInfo = new UserInfoModel(newUserInfo);
    await this.invoiceLockService.retrieveInvoiceLock(this.falconInvoiceNumber).toPromise();
    const lock = this.invoiceLockService.getInvoiceLock();

    const hasPermission = this.userInfo.hasAtLeastOnePermission(this.requiredPermissions);

    if ((!lock || lock?.currentUser) && hasPermission && isFeatureEnabled) {
      this.invoiceService.getAllowedStatuses(this.falconInvoiceNumber).subscribe(
        i => {this.greyStatusEditButton = (i.length === 0)}
      );
      this.enableStatusEditButton = true;
    }
  }

  disableEditStatusButton() {
     return this.greyStatusEditButton || this.isInGlobalEditMode;
  }

  async clickStatusEditButton(): Promise<void> {
    if(!this.disableEditStatusButton()) {
      await this.invoiceLockService.createInvoiceLock(this.falconInvoiceNumber);

      const modalResponse = await this.utilService.openNewStatusEditModal({
        "falconInvoiceNumber": this.falconInvoiceNumber
      }).pipe(first()).toPromise();

      if (modalResponse !== null) {
        const lock = this.invoiceLockService.getInvoiceLock();
        this.isCurrentUser = !!lock?.currentUser;
        if (this.isCurrentUser) {
          await this.invoiceLockService.releaseInvoiceLock();
        }
        this.reloadPage.emit();
      }
    }
  }
}

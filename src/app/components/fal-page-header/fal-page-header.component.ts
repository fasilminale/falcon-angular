import {Component, EventEmitter, Input, Output} from '@angular/core';
import { ElmLinkInterface,  DataTableComponent} from '@elm/elm-styleguide-ui/lib/components/data-table/data-table.component';
import {first} from 'rxjs/operators';
import {UtilService} from '../../services/util-service';
import {ToastService} from '@elm/elm-styleguide-ui';
import {UserInfoModel} from '../../models/user-info/user-info-model';
import {UserService} from '../../services/user-service';
import {ElmUamPermission} from '../../utils/elm-uam-permission';
import {InvoiceLockService} from '../../services/invoice-lock-service';

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
              private invoiceLockService: InvoiceLockService
              ) {
  }

  public enableStatusEditButton = false;

  @Input() headerTitle = '';
  @Input() headerTitleStyling?: string;
  @Input() headerSubtitle = '';
  @Input() headerSubtitleStyling?: string;
  @Input() margin = '0 -24px 24px';
  @Input() contentFlex: string | undefined;
  @Input() breadcrumbs: Array<ElmLinkInterface> = [];
  @Input() helpUrl = '';
  @Input() falconInvoiceNumber = '';
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

    this.userInfo = new UserInfoModel(newUserInfo);
    await this.invoiceLockService.retrieveInvoiceLock(this.falconInvoiceNumber).toPromise();
    const lock = this.invoiceLockService.getInvoiceLock();

    const hasPermission = this.userInfo.hasPermission(this.requiredPermissions);

    console.log("------- " + lock)
    console.log("-------2 " + lock?.currentUser)
    console.log("-------2 " + lock?.user)
    console.log("-------2 " + lock?.falconInvoiceNumber)
    console.log("-------3 " + hasPermission)

    if ((!lock || lock?.currentUser) && hasPermission) {
      this.enableStatusEditButton = true;
    }
  }

  async clickStatusEditButton(): Promise<void> {
    await this.invoiceLockService.createInvoiceLock(this.falconInvoiceNumber);

    const modalResponse = await this.utilService.openNewStatusEditModal({"falconInvoiceNumber": this.falconInvoiceNumber
    }).pipe(first()).toPromise();

    if (modalResponse === undefined) {
      await this.invoiceLockService.releaseInvoiceLock();
      this.reloadPage.emit();
    }
  }
}

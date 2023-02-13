import {Component, EventEmitter, Input, Output} from '@angular/core';
import { ElmLinkInterface,  DataTableComponent} from '@elm/elm-styleguide-ui/lib/components/data-table/data-table.component';
import {first} from 'rxjs/operators';
import {UtilService} from '../../services/util-service';
import {ToastService} from '@elm/elm-styleguide-ui';
import {UserInfoModel} from '../../models/user-info/user-info-model';
import {UserService} from '../../services/user-service';
import {ElmUamPermission} from '../../utils/elm-uam-permission';

@Component({
  selector: 'fal-elm-page-header',
  templateUrl: './fal-page-header.component.html',
  styleUrls: ['./fal-page-header.component.scss']
})
export class FalPageHeaderComponent {
  public userInfo: UserInfoModel | undefined;
  private readonly requiredPermissions = [ElmUamPermission.ALLOW_EDIT_STATUS];
  public hasPermission: boolean = false;

  ngOnInit(): void {
    this.userService.getUserInfo().subscribe(userInfo => {
      this.userInfo = new UserInfoModel(userInfo);
      this.enableStatusEditButton = this.userInfo.hasPermission(this.requiredPermissions);;
    });
  }

  constructor(private utilService: UtilService,private userService: UserService
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
  @Output("reloadPage") reloadPage: EventEmitter<any> = new EventEmitter()

  async clickStatusEditButton(): Promise<void> {
    const modalResponse = await this.utilService.openNewStatusEditModal({"falconInvoiceNumber": this.falconInvoiceNumber
    }).pipe(first()).toPromise();

    if (modalResponse === undefined) {
      this.reloadPage.emit();
    }
  }
}

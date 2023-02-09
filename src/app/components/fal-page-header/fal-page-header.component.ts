import {Component, EventEmitter, Input, Output} from '@angular/core';
import { ElmLinkInterface,  DataTableComponent} from '@elm/elm-styleguide-ui/lib/components/data-table/data-table.component';
import {first} from 'rxjs/operators';
import {UtilService} from '../../services/util-service';
import {ToastService} from '@elm/elm-styleguide-ui';

@Component({
  selector: 'fal-elm-page-header',
  templateUrl: './fal-page-header.component.html',
  styleUrls: ['./fal-page-header.component.scss']
})
export class FalPageHeaderComponent {

  constructor(private utilService: UtilService) {
  }

  public enableStatusEditButton = true;

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
    console.log("modal repsonse " + modalResponse);
    //this.reloadPage.emit();

    if (modalResponse) {
      this.reloadPage.emit();
    }
    //this.isTripEditMode$.value = true;
    //this._editableFormArray.enable();
    //this.updateAndContinueClickEvent.emit({event: 'edit', value: false});
  }
}

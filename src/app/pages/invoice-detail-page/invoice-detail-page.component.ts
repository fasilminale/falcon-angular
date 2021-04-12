import {Component, OnInit, ViewChild} from '@angular/core';
import {FalFileInputComponent} from '../../components/fal-file-input/fal-file-input.component';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationModalComponent} from '@elm/elm-styleguide-ui';
import {MatDialog} from '@angular/material/dialog';
import {environment} from '../../../environments/environment';
import {WebServices} from '../../services/web-services';

@Component({
  selector: 'app-detail-create-page',
  templateUrl: './invoice-detail-page.component.html',
  styleUrls: ['./invoice-detail-page.component.scss']
})
export class InvoiceDetailPageComponent implements OnInit {

  public readonly regex = /[a-zA-Z0-9_\\-]/;

  @ViewChild(FalFileInputComponent) fileChooserInput?: FalFileInputComponent;

  public readOnly = true;
  public milestonesTabOpen = false;
  public falconInvoiceNumber = '';
  public milestones: Array<any> = [];

  public constructor(private webService: WebServices,
                     private router: Router,
                     private route: ActivatedRoute,
                     private dialog: MatDialog) {
  }

  public ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const falconInvoiceNumber = params.get('falconInvoiceNumber');
      falconInvoiceNumber ? this.falconInvoiceNumber = falconInvoiceNumber : this.falconInvoiceNumber = '';
    });
  }

  public updateMilestones(milestones: any): void {
    this.milestones = milestones;
  }

  public toggleMilestones(): void {
    this.milestonesTabOpen = !this.milestonesTabOpen;
  }

  public editInvoice(): void {
    this.readOnly = false;
  }

  public deleteInvoice(): void {
    this.dialog.open(ConfirmationModalComponent,
      {
        autoFocus: false,
        data: {
          title: 'Delete Invoice',
          innerHtmlMessage: `Are you sure you want to delete this invoice?
                 <br/><br/><strong>This action cannot be undone.</strong>`,
          confirmButtonText: 'Delete Invoice',
          cancelButtonText: 'Cancel'
        }
      })
      .afterClosed()
      .subscribe(() => {
        this.webService.httpDelete(`${environment.baseServiceUrl}/v1/invoice/${this.falconInvoiceNumber}`)
          .subscribe(() => {
            return this.router.navigate([`/invoices`], { queryParams: { falconInvoiceNumber: this.falconInvoiceNumber } });
          });
      });
  }
}

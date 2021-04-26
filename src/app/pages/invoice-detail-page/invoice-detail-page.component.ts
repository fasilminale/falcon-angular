import {Component, OnInit, ViewChild} from '@angular/core';
import {FalFileInputComponent} from '../../components/fal-file-input/fal-file-input.component';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationModalComponent} from '@elm/elm-styleguide-ui';
import {MatDialog} from '@angular/material/dialog';
import {environment} from '../../../environments/environment';
import {WebServices} from '../../services/web-services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {InvoiceFormComponent} from '../../components/invoice-form/invoice-form.component';

@Component({
  selector: 'app-detail-create-page',
  templateUrl: './invoice-detail-page.component.html',
  styleUrls: ['./invoice-detail-page.component.scss']
})
export class InvoiceDetailPageComponent implements OnInit {

  public readonly regex = /[a-zA-Z0-9_\\-]/;

  @ViewChild(FalFileInputComponent) fileChooserInput?: FalFileInputComponent;
  @ViewChild(InvoiceFormComponent) invoiceForm?: InvoiceFormComponent;

  public readOnly = true;
  public milestonesTabOpen = false;
  public falconInvoiceNumber = '';
  public milestones: Array<any> = [];

  public constructor(private webService: WebServices,
                     private router: Router,
                     private route: ActivatedRoute,
                     private dialog: MatDialog,
                     private snackBar: MatSnackBar) {
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
      .subscribe(result => {
        if (result) {
          this.webService.httpDelete(`${environment.baseServiceUrl}/v1/invoice/${this.falconInvoiceNumber}`)
            .subscribe(() => {
                return this.router.navigate([`/invoices`], {queryParams: {falconInvoiceNumber: this.falconInvoiceNumber}});
              },
              () => this.snackBar.open(`Failure, invoice was not deleted.`, 'close', {duration: 5 * 1000}));
        }
      });
  }

  public saveAsTemplate(): void {
    // @ts-ignore
    this.invoiceForm?.saveTemplate();
  }
}

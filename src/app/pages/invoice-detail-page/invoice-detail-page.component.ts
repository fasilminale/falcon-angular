import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FalFileInputComponent} from '../../components/fal-file-input/fal-file-input.component';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationModalComponent} from '@elm/elm-styleguide-ui';
import {MatDialog} from '@angular/material/dialog';
import {environment} from '../../../environments/environment';
import {WebServices} from '../../services/web-services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {InvoiceFormComponent} from '../../components/invoice-form/invoice-form.component';
import {Subscription} from 'rxjs';
import {TimeService} from '../../services/time-service';

@Component({
  selector: 'app-detail-create-page',
  templateUrl: './invoice-detail-page.component.html',
  styleUrls: ['./invoice-detail-page.component.scss']
})
export class InvoiceDetailPageComponent implements OnInit, OnDestroy {

  public readonly regex = /[a-zA-Z0-9_\\-]/;

  @ViewChild(FalFileInputComponent) fileChooserInput?: FalFileInputComponent;
  @ViewChild(InvoiceFormComponent) invoiceForm?: InvoiceFormComponent;

  public readOnly = true;
  public milestonesTabOpen = false;
  public isDeletedInvoice = false;
  public falconInvoiceNumber = '';
  public milestones: Array<any> = [];
  public invoiceStatus = '';

  private subscriptions: Array<Subscription> = [];

  public constructor(private webService: WebServices,
                     private router: Router,
                     private route: ActivatedRoute,
                     private dialog: MatDialog,
                     private snackBar: MatSnackBar,
                     private timeService: TimeService) {
  }

  public ngOnInit(): void {
    this.subscriptions.push(
      this.route.paramMap.subscribe(params => {
        const newFalconInvoiceNumber = params.get('falconInvoiceNumber');
        this.falconInvoiceNumber = newFalconInvoiceNumber ? newFalconInvoiceNumber : '';
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public updateMilestones(milestones: any): void {
    this.milestones = milestones;
    this.milestones.sort((a: any, b: any) => {
      return b.timestamp.localeCompare(a.timestamp);
    });
    this.invoiceStatus = this.milestones[0].status.label;
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
            .subscribe(
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

  public formatTimestamp(value: string): string | undefined {
    return this.timeService.formatTimestamp(value, 'MM/DD/YY, HH:mm z');
  }
}

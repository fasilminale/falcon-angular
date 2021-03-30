import {Component, OnInit, ViewChild} from '@angular/core';
import {FalFileInputComponent} from '../../components/fal-file-input/fal-file-input.component';
import {ActivatedRoute} from '@angular/router';

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

  public constructor(private route: ActivatedRoute) {
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
}

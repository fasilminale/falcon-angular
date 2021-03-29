import {Component, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {WebServices} from '../../services/web-services';
import {environment} from '../../../environments/environment';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {LoadingService} from '../../services/loading-service';
import {HttpClient} from '@angular/common/http';
import {FalFileInputComponent} from '../../components/fal-file-input/fal-file-input.component';
import {map, mergeMap} from 'rxjs/operators';
import { forkJoin } from 'rxjs';

interface Attachment {
  file: File;
  type: string;
  uploadError: boolean;
}

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

  private invoice = new InvoiceDataModel();

  public constructor() {
  }

  public ngOnInit(): void {
  }

  public updateMilestones(milestones: any): void {
    this.milestones = milestones;
  }

  public toggleMilestones(): void {
    this.milestonesTabOpen = !this.milestonesTabOpen;
  }
}

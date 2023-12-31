import {Component, EventEmitter, HostListener, Inject, OnInit, Output} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {TemplateService} from '../../services/template-service';
export interface TemplateInputModalComponentData {
  isPaymentOverrideSelected: boolean;
}
@Component({
  selector: 'app-template-input-modal',
  template: `
    <div mat-dialog-title class="d-flex align-items-center">
      <span class="headline2">Save as Template</span>
      <elm-close-button class="dialog-close-button" mat-dialog-close></elm-close-button>
    </div>
    <div mat-dialog-content class="modal-body">
      <div class="col-12">
        <label for="template-name-input" class="form-label fieldLabel1">
          Template Name
        </label>
        <input type="text"
               id="template-name-input"
               class="form-control"
               [(ngModel)]="template.name"
               [ngClass]="this.isTemplateDuplicate?'error':''"
        />
        <small class="error-text"
               *ngIf="this.isTemplateDuplicate">
          Template Name already exists
        </small>

      </div>
      <div class="col-12">
        <label for="description-input" class="form-label fieldLabel1 label">
          Description (optional)
        </label>
        <input type="text"
               id="description-input"
               class="form-control"
               [(ngModel)]="template.description"
        />
      </div>
      <div *ngIf="data.isPaymentOverrideSelected">
        <label for="description-input" class="form-label fieldLabel1 label">
          <strong>Selected Override of Standard Payment Terms will NOT be
          included in template</strong>
        </label>
      </div>
    </div>

    <div mat-dialog-actions class="float-right">
      <elm-button buttonStyle="secondary"
                  class="ms-auto"
                  mat-dialog-close
                  id="cancel"
                  aria-label="cancel">
        Cancel
      </elm-button>
      <elm-button buttonStyle="primary"
                  class="ms-3"
                  (buttonClick)="confirm()"
                  [isDisabled]="!template.name"
                  id="confirm"
                  aria-label="confirm">
        Save as Template
      </elm-button>
    </div>
  `,
  styleUrls: ['./template-input-modal.component.scss']
})
export class TemplateInputModalComponent implements OnInit {

  template: Template = {
    name: '',
    description: ''
  };

  isTemplateDuplicate: boolean = false;

  @Output() createTemplate: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private dialogRef: MatDialogRef<TemplateInputModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TemplateInputModalComponentData,
    private templateService: TemplateService) {}

  ngOnInit(): void {
  }

  @HostListener('window:keyup', ['$event'])
  confirmOnEnterKeyEvent(event: KeyboardEvent): void {
    if (event.code === 'Enter') {
      this.confirm();
    }
  }

  async  confirm(): Promise<void>  {
    this.isTemplateDuplicate  = await this.templateService.checkTemplateIsDuplicate(this.template.name).toPromise();

    if(!this.isTemplateDuplicate) {
      this.dialogRef.close(this.template);
    }
  }
}

type Template = {
  name: string;
  description: string;
};

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { ConfirmationModalComponent } from '@elm/elm-styleguide-ui';
import { Template } from 'src/app/models/template/template-model';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-manage-my-templates',
  templateUrl: './manage-my-templates.component.html',
  styleUrls: ['./manage-my-templates.component.scss']
})
export class ManageMyTemplatesComponent implements OnInit {

  @ViewChild(MatTable, { static: true })
  templateTable!: MatTable<Template>;
  templates: Array<Template> = [];
  displayedColumns: string[] = ['createdDate', 'name', 'description', 'action'];
  editedTemplate: Template | undefined;

  constructor(
    private apiService: ApiService,
    private util: UtilService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.apiService.getTemplates().subscribe(
      (templates) => {
        templates.map((template: any) => {
          this.templates.push(new Template(template));
          this.templateTable.renderRows();
        });;
      });
    }

    editTemplate(template: Template) {
      if (template.isDisable) {
        if(this.editedTemplate){
          this.cancelTemplate(this.editedTemplate);
        }
        template.isDisable = false;
        template.tempName = template.name;
        template.tempDesc = template.description;
        this.editedTemplate = template;
      } 
    }

    cancelTemplate(template: Template) {
      if (!template.isDisable ) {
        template.isError = false;
        template.isDisable = true;
        template.name = template.tempName;
        template.description = template.tempDesc;
      }
    }

    updateTemplate(template: Template) {
      if(!template.name) {
        return;
      }
      
      if (!template.isDisable ) {
        
        this.apiService.updateTemplate(parseInt(template.templateId), template).subscribe(
          (data) => {
            template.createdDate = data.createdDate;
            template.isError = false;
            this.onSuccess(`Success! Template has been updated.`);
          },
          (error: any) => {
            if(error.status === 422) {
              template.isError = true;
            } else {
              this.onFail(`Failure! Template has been failed.`);
            }
          },
          () => {
            template.isDisable = true;
          }
        )
      }
    }

    deleteTemplate(template: Template) {
      this.dialog.open(ConfirmationModalComponent,
        {
          autoFocus: false,
          data: {
            title: 'Delete Template',
            innerHtmlMessage: `Are you sure you want to delete ${template.name}?
                   <br/><br/><strong>This action cannot be undone.</strong>`,
            confirmButtonText: 'Delete Template',
            cancelButtonText: 'Cancel'
          }
        })
        .afterClosed()
        .subscribe(result => {
          if (result) {
            this.apiService.deleteTemplate(parseInt(template.templateId))
              .subscribe(
                () => {
                  this.templates.splice(this.templates.findIndex(temp => temp.templateId === template.templateId), 1);
                  this.templateTable.renderRows();
                  this.onSuccess(`Success! ${template.name} has been deleted.`);
                }, 
                (error) => {
                  this.onFail(`Failure! ${template.name} failed to delete.`);
                }
              );
          }
        });
    }
    private onSuccess(msg: string): void {
      this.util.openSnackBar(msg);
    }
    private onFail(msg: string): void {
      this.util.openSnackBar(msg);
    }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
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

  constructor(
    private apiService: ApiService,
    private util: UtilService,
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
      if (template.isDisable ) {
        template.isDisable = false;
        template.tempName = template.name;
        template.tempDesc = template.description;
      } 
    }

    cancelTemplate(template: Template) {
      if (!template.isDisable ) {
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
            this.onSaveSuccess();
          },
          (error: any) => {
            if(error.status === 422) {
              template.isError = true;
            } else {
              this.onSaveFail();
            }
          },
          () => {
            template.isDisable = true;
          }
        )
      }
    }

    private onSaveSuccess(): void {
      this.util.openSnackBar(`Success! Template has been updated.`);
    }
    private onSaveFail(): void {
      this.util.openSnackBar(`Failure! Template has been failed.`);
    }
}

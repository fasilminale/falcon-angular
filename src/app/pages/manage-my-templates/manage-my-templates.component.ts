import { Component, OnInit } from '@angular/core';
import { Template } from 'src/app/models/template/template-model';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';

@Component({
  selector: 'app-manage-my-templates',
  templateUrl: './manage-my-templates.component.html',
  styleUrls: ['./manage-my-templates.component.scss']
})
export class ManageMyTemplatesComponent implements OnInit {

  templates: Array<Template> = [];
  displayedColumns: string[] = ['createdDate', 'name', 'description', 'action'];
  constructor(
    private apiService: ApiService,
    private util: UtilService,
  ) { }

  ngOnInit() {
    this.apiService.getTemplates().subscribe(
      (templates) => {
        console.log(templates);
        templates.map((template: any) => {
          this.templates.push(new Template(template));
        });;
      });
    }

    editTemplate(template: Template) {
      if (template.isDisable ) {
        template.isDisable = false;
      } else {
        template.isDisable = true;
        this.updateTemplate(template);
      }
    }

    cancelTemplate(template: Template) {
      if (!template.isDisable ) {
        template.isDisable = true;
      }
    }

    updateTemplate(template: Template) {
      this.apiService.updateTemplate(template.name, template).subscribe(
        (data) => {
          template.description = data.description;
          template.createdDate = data.createdDate;
          this.onSaveSuccess();
        }
      )
    }

    private onSaveSuccess(): void {
      this.util.openSnackBar(`Success! Template has been updated.`);
    }
}

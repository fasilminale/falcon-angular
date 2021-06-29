import {WebServices} from './web-services';
import {catchError, mergeMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {environment} from '../../environments/environment';
import {Injectable} from '@angular/core';
import {Template, TemplateToSave} from '../models/template/template-model';

@Injectable()
export class TemplateService {

  constructor(private web: WebServices) {
  }

  public checkTemplateIsDuplicate(templateName: any): Observable<boolean> {
    return this.checkTemplateExists(templateName)
      .pipe(
        mergeMap((response: any) => {
            return response
              ? of(response.name === templateName)
              : of(true);
          }
        ),
        catchError(() =>
          of(false)
        )
      );
  }

  public checkTemplateExists(templateName: any): Observable<any> {
    return this.web.httpGetSkipIntereptor(
      `${environment.baseServiceUrl}/v1/template/${templateName}`
    );
  }

  public createTemplate(template: TemplateToSave): Observable<any> {
    return this.web.httpPost(`${environment.baseServiceUrl}/v1/template`, template);
  }

  public getTemplates(): Observable<any> {
    return this.web.httpGet(`${environment.baseServiceUrl}/v1/templates`);
  }

  public getTemplateByName(name: string): Observable<Template | null> {
    return this.web.httpGet(`${environment.baseServiceUrl}/v1/template/${name}`)
      .pipe(
        mergeMap(t => of(t as Template)),
        catchError(t => of(null))
      );
  }

  public updateTemplate(templateId: number, template: Template): Observable<any> {
    return this.web.httpPut(`${environment.baseServiceUrl}/v1/template/${templateId}`, template);
  }

  public deleteTemplate(templateId: number): Observable<any> {
    return this.web.httpDelete(`${environment.baseServiceUrl}/v1/template/${templateId}`);
  }
}

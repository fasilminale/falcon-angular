import {TestBed} from '@angular/core/testing';
import {WebServices} from './web-services';
import {TemplateService} from './template-service';
import {of, throwError} from 'rxjs';
import {Template} from '../models/template/template-model';
import {FalconTestingModule} from '../testing/falcon-testing.module';

describe('TemplateService', () => {

  let templateService: TemplateService;
  let web: WebServices;
  let template: any;
  let manageTemplate: Template;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FalconTestingModule],
    });
    web = TestBed.inject(WebServices);
    templateService = new TemplateService(web);
    template = {
      name: 'testTemplate',
      description: 'testDescription'
    };
    manageTemplate = new Template({
      templateId: '1',
      description: '',
      name: 'test',
      isDisable: true,
      createdDate: '',
      lineItems: [
        {
          companyCode: '',
          costCenter: '',
          glAccount: '',
          lineItemNumber: '',
        }
      ]
    });
  });

  it('should create', () => {
    expect(templateService).toBeTruthy();
  });

  it('template should be duplicate from matching template name', async () => {
    spyOn(web, 'httpGet').and.returnValue(of(template));
    const isDuplicate = await templateService.checkTemplateIsDuplicate(template.name).toPromise();
    expect(web.httpGet).toHaveBeenCalled();
    expect(isDuplicate).toBeTrue();
  });

  it('template should NOT be duplicate from non-matching template name', async () => {
    spyOn(web, 'httpGet').and.returnValue(throwError('test error'));
    const isDuplicate = await templateService.checkTemplateIsDuplicate('some other name').toPromise();
    expect(web.httpGet).toHaveBeenCalled();
    expect(isDuplicate).toBeFalse();
  });

  it('should create template', async () => {
    spyOn(web, 'httpPost').and.returnValue(of('SOME RESPONSE BODY'));
    await templateService.createTemplate(manageTemplate).toPromise();
    expect(web.httpPost).toHaveBeenCalled();
  });

  it('should get template by name', async () => {
    spyOn(web, 'httpGet').and.returnValue(of(template));
    const result = await templateService.getTemplateByName('test template name').toPromise();
    expect(result).toBeTruthy();
    expect(web.httpGet).toHaveBeenCalled();
  });

  it('should NOT get template from error', async () => {
    spyOn(web, 'httpGet').and.returnValue(throwError('test error'));
    const result = await templateService.getTemplateByName('test template name').toPromise();
    expect(result).toBeFalsy();
    expect(web.httpGet).toHaveBeenCalled();
  });

  it('should update template', async () => {
    spyOn(web, 'httpPut').and.returnValue(of('SOME RESPONSE BODY'));
    const parsedTemplateId = parseInt(manageTemplate.templateId);
    await templateService.updateTemplate(parsedTemplateId, manageTemplate).toPromise();
    expect(web.httpPut).toHaveBeenCalled();
  });

  it('should update template', async () => {
    spyOn(web, 'httpDelete').and.returnValue(of('SOME RESPONSE BODY'));
    const parsedTemplateId = parseInt(manageTemplate.templateId);
    await templateService.deleteTemplate(parsedTemplateId).toPromise();
    expect(web.httpDelete).toHaveBeenCalled();
  });

});

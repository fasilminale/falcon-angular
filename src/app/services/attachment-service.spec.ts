import {TestBed} from '@angular/core/testing';
import {WebServices} from './web-services';
import {of, throwError} from 'rxjs';
import {AttachmentService, FakeAttachmentService, RealAttachmentService} from './attachment-service';
import {FalconTestingModule} from '../testing/falcon-testing.module';
import {NeedSpyError} from '../testing/test-utils';


describe('AttachmentService', () => {

  let attachmentService: AttachmentService;

  const testAttachment = {
    file: new File([], 'TestFileBlobName'),
    attachmentType: 'TestAttachmentType',
    fileName: 'TestFileName'
  };

  const unmodifiedAttachment = {
    file: new File([], 'TestFileBlobName'),
    attachmentType: 'TestAttachmentType',
    fileName: 'TestFileName',
    action: 'NONE'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FalconTestingModule],
    });
  });

  // FAKE ATTACHMENT SERVICE TESTS
  describe('> FAKE >', () => {
    beforeEach(() => {
      attachmentService = new FakeAttachmentService();
    });
    it('should create', () => {
      expect(attachmentService).toBeTruthy();
    });
    it('should throw error on saveAttachments', () => {
      expect(() => attachmentService.saveAttachments('someInvoiceNumber', []))
        .toThrow(new NeedSpyError('AttachmentService', 'saveAttachments'));
    });
    it('should throw error on saveAccessorialAttachments', () => {
      const files: Array<File> = [];
      const chargeCodes: Array<string> = [];
      expect(() => attachmentService.saveAccessorialAttachments('someInvoiceNumber', chargeCodes, files))
        .toThrow(new NeedSpyError('AttachmentService', 'saveAccessorialAttachments'));
    });
  });

  // REAL ATTACHMENT SERVICE TESTS
  describe('> REAL >', () => {
    let web: WebServices;
    let invoice: any;
    let files: Array<File>;
    let chargeCodes: Array<string>;
    beforeEach(() => {
      web = TestBed.inject(WebServices);
      attachmentService = new RealAttachmentService(web);
      invoice = {
        falconInvoiceNumber: 'F0000000001',
        companyCode: '1234',
        vendorNumber: '2345',
        externalInvoiceNumber: '3456',
        invoiceDate: new Date()
      };
      files =  [new File([], 'testFileBlob')];
      chargeCodes = ['testChargeCode'];
    });
    it('should create', () => {
      expect(attachmentService).toBeTruthy();
    });
    it('should save attachments', async () => {
      spyOn(web, 'httpPost').and.returnValue(of('ACCEPTED'));
      const successes = await attachmentService.saveAttachments(
        invoice.falconInvoiceNumber, [testAttachment, unmodifiedAttachment]
      ).toPromise();
      expect(web.httpPost).toHaveBeenCalled();
      expect(successes).toEqual(true);
    });
    it('should save accessorial attachments', async () => {
      spyOn(web, 'httpPost').and.returnValue(of('ACCEPTED'));
      const successes = await attachmentService.saveAccessorialAttachments(
        invoice.falconInvoiceNumber, chargeCodes, files
      ).toPromise();
      expect(web.httpPost).toHaveBeenCalled();
      expect(successes).toEqual(true);
    });
    it('should fail unaccepted attachments', async () => {
      spyOn(web, 'httpPost').and.returnValue(of('SOME RESPONSE BODY'));
      const successes = await attachmentService.saveAttachments(
        invoice.falconInvoiceNumber, [testAttachment, unmodifiedAttachment]
      ).toPromise();
      expect(web.httpPost).toHaveBeenCalled();
      expect(successes).toEqual(false);
    });
    it('should fail unaccepted accessorial attachments', async () => {
      spyOn(web, 'httpPost').and.returnValue(of('SOME RESPONSE BODY'));
      const successes = await attachmentService.saveAccessorialAttachments(
        invoice.falconInvoiceNumber, chargeCodes, files
      ).toPromise();
      expect(web.httpPost).toHaveBeenCalled();
      expect(successes).toEqual(false);
    });
    it('should fail saving attachments', async () => {
      spyOn(web, 'httpPost').and.returnValue(throwError('test error'));
      const successes = await attachmentService.saveAttachments(
        invoice.falconInvoiceNumber, [testAttachment, unmodifiedAttachment]
      ).toPromise();
      expect(web.httpPost).toHaveBeenCalled();
      expect(successes).toEqual(false);
    });
    it('should fail saving accessorial attachments', async () => {
      spyOn(web, 'httpPost').and.returnValue(throwError('test error'));
      const successes = await attachmentService.saveAccessorialAttachments(
        invoice.falconInvoiceNumber, chargeCodes, files
      ).toPromise();
      expect(web.httpPost).toHaveBeenCalled();
      expect(successes).toEqual(false);
    });
    it('should not call attachments route', async () => {
      const successes = await attachmentService.saveAttachments(
        invoice.falconInvoiceNumber, []
      ).toPromise();
      expect(successes).toEqual(true);
    });
    it('should not call accessorial attachments route', async () => {
      const successes = await attachmentService.saveAccessorialAttachments(
        invoice.falconInvoiceNumber, [], []
      ).toPromise();
      expect(successes).toEqual(true);
    });
  });
});


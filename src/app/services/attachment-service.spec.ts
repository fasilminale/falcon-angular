import {TestBed} from '@angular/core/testing';
import {WebServices} from './web-services';
import {of, throwError} from 'rxjs';
import {AttachmentService, FakeAttachmentService, RealAttachmentService} from './attachment-service';
import {FalconTestingModule} from '../testing/falcon-testing.module';
import {NeedSpyError} from '../testing/fake-utils';


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
  });

  // REAL ATTACHMENT SERVICE TESTS
  describe('> REAL >', () => {
    let web: WebServices;
    let invoice: any;
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
    it('should fail unaccepted attachments', async () => {
      spyOn(web, 'httpPost').and.returnValue(of('SOME RESPONSE BODY'));
      const successes = await attachmentService.saveAttachments(
        invoice.falconInvoiceNumber, [testAttachment, unmodifiedAttachment]
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
    it('should not call attachments route', async () => {
      const successes = await attachmentService.saveAttachments(
        invoice.falconInvoiceNumber, []
      ).toPromise();
      expect(successes).toEqual(true);
    });
  });
});


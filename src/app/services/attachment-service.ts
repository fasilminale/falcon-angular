import {WebServices} from './web-services';
import {catchError, mergeMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {environment} from '../../environments/environment';
import {Injectable, InjectionToken} from '@angular/core';
import {NeedSpyError} from '../testing/test-utils';

// INTERFACE
export const ATTACHMENT_SERVICE = new InjectionToken<AttachmentService>('AttachmentService');

export interface AttachmentService {
  saveAttachments(invoiceNumber: string, attachments: Array<any>): Observable<boolean>;
}


// FAKE IMPLEMENTATION
@Injectable()
export class FakeAttachmentService implements AttachmentService {
  static PROVIDER = {provide: ATTACHMENT_SERVICE, useClass: FakeAttachmentService};

  saveAttachments(invoiceNumber: string, attachments: Array<any>): Observable<boolean> {
    throw new NeedSpyError('AttachmentService', 'saveAttachments');
  }
}


// REAL IMPLEMENTATION
@Injectable()
export class RealAttachmentService implements AttachmentService {
  static PROVIDER = {provide: ATTACHMENT_SERVICE, useClass: RealAttachmentService};

  constructor(private web: WebServices) {
  }

  public saveAttachments(invoiceNumber: string, attachments: Array<any>): Observable<boolean> {
    const files: Array<File> = [];
    const instructions: Array<any> = [];
    attachments
      .filter(a => a.action !== 'NONE')
      .forEach(a => {
        files.push(a.file);
        instructions.push({
          fileName: a.file.name,
          attachmentType: a.type,
          action: a.action
        });
      });
    if (files.length <= 0 || instructions.length <= 0) {
      return of(true);
    }
    const formData = new FormData();
    files.forEach(f => formData.append('files', f, f.name));
    formData.append('instructionsJson', JSON.stringify(instructions));
    return this.web.httpPost(
      `${environment.baseServiceUrl}/v1/attachment/${invoiceNumber}/batch`,
      formData
    ).pipe(
      mergeMap(result => of(result === 'ACCEPTED')),
      catchError(() => of(false))
    );
  }
}

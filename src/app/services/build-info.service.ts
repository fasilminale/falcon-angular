import {Injectable} from '@angular/core';
import {WebServices} from './web-services';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {UtilService} from './util-service';
import {mergeMap} from 'rxjs/operators';
import {TimeService} from './time-service';
import {InvoiceDataModel} from '../models/invoice/invoice-model';

@Injectable()
export class BuildInfoService {

  constructor(private web: WebServices,
              private util: UtilService,
              private time: TimeService) {
  }

  getBuildInfo(): Observable<BuildInfo> {
    return this.web.httpGet(`${environment.baseServiceUrl}/actuator/info`);
  }

  openBuildInfoModal(): Observable<boolean> {
    return this.getBuildInfo().pipe(mergeMap(
      info => {
        const formatTime = this.time.formatTimestamp(info.git.commit.time, 'MM/DD/YY HH:mm z');
        return this.util.openGenericModal({
          title: 'Build Info',
          innerHtmlMessage:
            '<table>' +
            `<tr><td align="right"><strong>Branch:&nbsp;</strong></td><td>${info.git.branch}</td></tr>` +
            `<tr><td align="right"><strong>Commit ID:&nbsp;</strong></td><td>${info.git.commit.id}</td></tr>` +
            `<tr><td align="right"><strong>Timestamp:&nbsp;</strong></td><td>${formatTime}</td></tr>` +
            '</table>',
          primaryButtonText: 'Close'
        });
      }));
  }

}

export type BuildInfo = {
  git: {
    branch: string,
    commit: {
      id: string,
      time: string,
    },
  }
};

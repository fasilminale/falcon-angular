import {Component, OnInit} from '@angular/core';
import {ElmDataTableHeader, ModalService, ButtonClickedEvent} from '@elm/elm-styleguide-ui';
import {MasterDataService} from '../../services/master-data-service';
import {TimeService} from '../../services/time-service';
import {MasterDataUploadModalComponent} from '../../components/master-data-upload-modal/master-data-upload-modal.component';
import { environment } from 'src/environments/environment';
import {saveAs} from 'file-saver';
import { EnvironmentService } from 'src/app/services/environment-service/environment-service';
import { WebServices } from 'src/app/services/web-services';
import {Observable} from 'rxjs';
import {UserService} from '../../services/user-service';
import {UserInfoModel} from '../../models/user-info/user-info-model';
import {ElmUamPermission} from '../../utils/elm-uam-permission';

type MasterDataFields = 'label' | 'lastUpdated' | 'endpoint' | 'download' | 'downloadTemplate' | 'hasDownloadableTemplate';

type MasterDataRow = { [field in MasterDataFields]: string };

@Component({
  selector: 'app-master-data-page',
  templateUrl: './master-data-page.component.html',
  styleUrls: ['./master-data-page.component.scss']
})
export class MasterDataPageComponent implements OnInit {
  public userInfo: UserInfoModel | undefined;
  headers: Array<ElmDataTableHeader> = [
    {header: 'label', label: 'Data Model'},
    {header: 'lastUpdated', label: 'Last Updated'},
    {header: 'download', label: 'Download', button: true, buttonStyle: 'text', prependIcon: 'description'},
    {header: 'downloadTemplate', label: '', button: true, buttonStyle: 'text', prependIcon: 'download'}
  ];
  masterDataRows: MasterDataRow[] = [];

  private readonly requiredPermissions = [ElmUamPermission.ALLOW_MASTER_DATA_UPLOAD];
  public hasMasterDataUpload = false;

  constructor(private masterDataService: MasterDataService,
              private timeService: TimeService,
              private environmentService: EnvironmentService,
              private modalService: ModalService,
              private webServices: WebServices,
              public userService: UserService) {
    this.getMasterData();
  }

  ngOnInit(): void {
    this.userService.getUserInfo().subscribe(userInfo => {
      this.userInfo = new UserInfoModel(userInfo);
      this.hasMasterDataUpload = this.userInfo.hasAtLeastOnePermission(this.requiredPermissions);;
    });
  }

  openFileUploadModal(): void {
    const configs = {
      minWidth: '525px',
      width: '33vw',
      autoFocus: false,
      data: {masterDataRows: this.masterDataRows}
    };
    this.modalService.openCustomModal(MasterDataUploadModalComponent, configs).subscribe(() => {
      this.getMasterData();
    });
  }

  getMasterData(): void {
    this.masterDataService.getMasterDataRows().subscribe((rows: MasterDataRow[]) => {
      this.masterDataRows = rows;
      this.masterDataRows.forEach(row => {
        row.lastUpdated = this.timeService.convertFromApiTime(row.lastUpdated);
        row.download = 'CURRENT FILE';
        row.downloadTemplate = !row.hasDownloadableTemplate ? '' : 'TEMPLATE';
      });
    });
  }

  downloadButtonClicked(buttonClickedEvent: ButtonClickedEvent): void {
    if (buttonClickedEvent.header === 'download') {
      return this.csvDownloadAPICall(buttonClickedEvent.rowData.endpoint);
    } else if (buttonClickedEvent.header === 'downloadTemplate') {
      this.templateDownloadAPICall(buttonClickedEvent.rowData.endpoint).subscribe(
        (url) => {
          this.downloadTemplate(url);
        }
      );
    }
  }

  downloadTemplate(url: string): void {
    window.location.href = url;
  }

  csvDownloadAPICall(endpoint: string): void {
    this.webServices.httpGet(`${environment.baseServiceUrl}/v1/${endpoint}/csv`, {responseType: 'text'}).subscribe(
      (data: any) => {
        const filename = endpoint + '.csv';
        this.saveCSVFile(data, filename);
      }
    );
  }

  templateDownloadAPICall(endpoint: string): Observable<string> {
    return this.webServices.httpGet(`${environment.baseServiceUrl}/v1/${endpoint}/template`, {responseType: 'text'});
  }

  saveCSVFile(data: any, filename: string): void {
    const blob = new Blob([data], {type: 'text/csv'});
    saveAs(blob, filename);
  }
}

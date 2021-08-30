import {Component} from '@angular/core';
import {ElmDataTableHeader, ModalService} from '@elm/elm-styleguide-ui';
import {MasterDataService} from '../../services/master-data-service';
import {TimeService} from '../../services/time-service';
import {MasterDataUploadModalComponent} from '../../components/master-data-upload-modal/master-data-upload-modal.component';

type MasterDataFields = 'label' | 'lastUpdated' | 'endpoint' | 'download';
type MasterDataRow = { [field in MasterDataFields]: string };

@Component({
  selector: 'app-master-data-page',
  templateUrl: './master-data-page.component.html',
  styleUrls: ['./master-data-page.component.scss']
})
export class MasterDataPageComponent {
  headers: Array<ElmDataTableHeader> = [
    {header: 'label', label: 'Data Model'},
    {header: 'lastUpdated', label: 'Last Updated'},
    {header: 'download', label: 'Download', button: true, buttonStyle: 'text', prependIcon: 'description'},
  ];
  masterDataRows: MasterDataRow[] = [];

  constructor(private masterDataService: MasterDataService,
              private timeService: TimeService,
              private modalService: ModalService) {
    this.masterDataService.getMasterDataRows().subscribe((rows: MasterDataRow[]) => {
      this.masterDataRows = rows;
      this.masterDataRows.forEach(row => {
        row.lastUpdated = timeService.convertFromApiTime(row.lastUpdated);
        row.download = 'CURRENT FILE';
      });
    });
  }
  openFileUploadModal(): void {
    const configs = {
      minWidth: '525px',
      width: '33vw',
      autoFocus: false,
      data: {masterDataRows: this.masterDataRows}
    };
    this.modalService.openCustomModal(MasterDataUploadModalComponent, configs);
  }
}

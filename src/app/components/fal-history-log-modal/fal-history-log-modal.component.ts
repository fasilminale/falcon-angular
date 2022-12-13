import {Component, Inject} from '@angular/core';
import {ElmDataTableHeader, ElmTooltipInterface} from '@elm/elm-styleguide-ui';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {MAT_DIALOG_DATA} from 'node_modules/@elm/elm-styleguide-ui/node_modules/@angular/material/dialog';
import {HistoryLog} from '../../models/invoice/history-log';
import {environment} from '../../../environments/environment';
import {UtilService} from '../../services/util-service';

@Component({
  selector: 'app-fal-history-log-modal',
  templateUrl: './fal-history-log-modal.component.html',
  styleUrls: ['./fal-history-log-modal.component.scss']
})
export class FalHistoryLogModalComponent {
  headers: Array<ElmDataTableHeader> = [
    {header: 'field', label: 'Field'},
    {header: 'oldValue', label: 'Old Value'},
    {header: 'newValue', label: 'New Value'},
    {header: 'action', label: 'Action'},
    {header: 'updatedDate', label: 'Last Updated On'},
    {header: 'updatedBy', label: 'Updated By'},
    {header: 'updatedTimes', label: '# of Updates'},
  ];
  columnTooltips: ElmTooltipInterface = {
    field: 'description'
  }
  falconInvoiceNumber = '';
  invoiceStatus = '';
  historyLogs: Array<HistoryLog> = [];
  filteredHistoryLogs: Array<any> = [];
  expandedFields: { [key: string]: boolean } = {};
  fieldUpdateCount: { [key: string]: number } = {};

  constructor(@Inject(MAT_DIALOG_DATA) public data: InvoiceDataModel,
              private utilService: UtilService) {
    this.falconInvoiceNumber = data.falconInvoiceNumber;
    this.invoiceStatus = data.status?.label;
    this.historyLogs = data.historyLogs;

    // this only needs calculated once and saved in the map, yay!
    this.historyLogs.forEach(historyLog => {
      const currentBest = this.fieldUpdateCount[historyLog.field] ?? 0;
      const valueToTest = historyLog.updatedTimes;
      // the largest updateTimes value for any field will be from the latest update to that field
      // we store it so we can use it later to identify the log that is from the latest update per field
      this.fieldUpdateCount[historyLog.field] = Math.max(currentBest, valueToTest);
    });

    // this should be the first time the filtered logs are calculated
    this.reCalculateFilteredLogs();
  }

  reCalculateFilteredLogs(): void {
    this.filteredHistoryLogs = this.historyLogs
      .filter((historyLog: HistoryLog) => {
        // history logs that belong to an expanded field are allowed through the filter
        return this.expandedFields[historyLog.field]
          // history logs that are the last update for that field are allowed through the filter
          || this.fieldUpdateCount[historyLog.field] === historyLog.updatedTimes;
      })
      .map(historyLog => {
        // map to apply the hyperlink styling to specific history log objects
        // doing this only to the filtered list so the updateTimes can stay a number
        // for the filter call above
        if (historyLog.updatedTimes > 1
          && this.fieldUpdateCount[historyLog.field] === historyLog.updatedTimes) {
          // add the hyperlink styling to the latest update of the field
          // but only add it if there are other collapsed updates
          return {
            ...historyLog,
            updatedTimes: `<a class="updatedTimeClickable">${historyLog.updatedTimes}</a>`
          };
        }
        // otherwise keep the history log as is
        return historyLog;
      });
  }

  onDataTableRowSelect(selectionEvent: Array<HistoryLog>): void {
    // pull the selected history log from the selection array
    // in our scenario there is always either one value in the array or none
    const selectedHistoryLog = selectionEvent.length > 0 ? selectionEvent[0] : undefined;
    if (selectedHistoryLog) {
      // if selected value exists, toggle the expand/collapse status for that field
      this.toggleFieldExpandCollapse(selectedHistoryLog.field);
    }
    // regardless of what happens, recalculate the filter for posterity
    this.reCalculateFilteredLogs();
  }

  toggleFieldExpandCollapse(field: string): void {
    // will coerce undefined into boolean without extra work, yay!
    this.expandedFields[field] = !this.expandedFields[field];
  }

  downloadCsv(): void {
    this.utilService.downloadCsv(`${this.falconInvoiceNumber}.HistoryLog.csv`,
      `${environment.baseServiceUrl}/v1/invoice/${this.falconInvoiceNumber}/historyLog/csvData`,
      {});
  }

}

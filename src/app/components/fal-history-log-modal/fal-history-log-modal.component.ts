import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {DataTableComponent, ElmDataTableHeader} from '@elm/elm-styleguide-ui';
import {InvoiceDataModel} from '../../models/invoice/invoice-model';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {HistoryLog} from '../../models/invoice/history-log';

@Component({
  selector: 'app-fal-history-log-modal',
  templateUrl: './fal-history-log-modal.component.html',
  styleUrls: ['./fal-history-log-modal.component.scss']
})
export class FalHistoryLogModalComponent implements OnInit {
  headers: Array<ElmDataTableHeader> = [
    {header: 'field', label: 'Field'},
    {header: 'oldValue', label: 'Old Value'},
    {header: 'newValue', label: 'New Value'},
    {header: 'action', label: 'Action'},
    {header: 'updatedDate', label: 'Last Updated On'},
    {header: 'updatedBy', label: 'Updated By'},
    {header: 'updatedTimes', label: '# of Updates'},
  ];
  falconInvoiceNumber = '';
  invoiceStatus = '';
  historyLogs: Array<HistoryLog> = [];
  filteredHistoryLogs: Array<HistoryLog> = [];
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  constructor(@Inject(MAT_DIALOG_DATA) public data: InvoiceDataModel) {
    this.falconInvoiceNumber = data.falconInvoiceNumber;
    this.invoiceStatus = data.status?.label;

    // Setup logs
    const historyLogSet = new Set();
    this.historyLogs = data.historyLogs.map(log => {
      if (historyLogSet.has(log.field)) {
        log.current = false;
      } else {
        log.current = true;
        historyLogSet.add(log.field);
      }
      log.fullHistory = false;
      return new HistoryLog(log);
    });

    // Filter logs to display
    historyLogSet.clear();
    this.filteredHistoryLogs = this.historyLogs.filter(log => {
      if (historyLogSet.has(log.field)) {
        return false;
      }
      historyLogSet.add(log.field);
      return true;
    });
  }

  ngOnInit(): void {
  }

  toggleFullHistory(event: any): void {
    const value = event[0];
    const hl = this.filteredHistoryLogs.find(l => l.field === value.field);
    const historyLog = hl !== undefined ? hl : new HistoryLog();

    if (!historyLog.current) {
      return;
    }

    historyLog.fullHistory = !historyLog.fullHistory;

    const fields = new Set();
    this.filteredHistoryLogs = this.historyLogs.filter(log => {
      if ((!historyLog.fullHistory && historyLog.field === log.field) && fields.has(log.field)) {
        return false;
      }
      fields.add(log.field);
      return true;
    });
  }

}

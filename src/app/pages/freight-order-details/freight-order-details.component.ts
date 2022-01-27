import { Component, OnInit } from '@angular/core';
import { InvoiceService } from 'src/app/services/invoice-service';

@Component({
  selector: 'app-freight-order-details',
  templateUrl: './freight-order-details.component.html',
  styleUrls: ['./freight-order-details.component.scss']
})
export class FreightOrderDetailsComponent implements OnInit {

  displayedColumns: string[] = ['freightOrderNumber', 'tmsLoadId', 'warehouse', 'sequence','stopId','destination','grossWeight', 'volume', 'pallets', 'actions'];


  freightOrders: any[] = [];
  freightOrderTitle = '';
  constructor(private invoiceService: InvoiceService) {

  }

  ngOnInit(): void {
    this.invoiceService.getFreightOrderDetails()
      .subscribe(freightOrders => {
         this.freightOrders = freightOrders;
         this.freightOrderTitle = `Freight Orders in Trip (${this.freightOrders.length})`
      })
  }

  editFreightOrder(freightOrder: any) {
    freightOrder.isDisable = false;
  }

}

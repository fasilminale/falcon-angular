import { Component, Inject, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FreightOrder } from 'src/app/models/freight-order/freight-order-model';
import { SubscriptionManager, SUBSCRIPTION_MANAGER } from 'src/app/services/subscription-manager';

@Component({
  selector: 'app-freight-order-details',
  templateUrl: './freight-order-details.component.html',
  styleUrls: ['./freight-order-details.component.scss']
})
export class FreightOrderDetailsComponent implements OnInit {

  displayedColumns: string[] = ['freightOrderNumber', 'tmsLoadId', 'warehouse', 'sequence','stopId','destination','grossWeight', 'volume', 'pallets', 'actions'];


  freightOrders: FreightOrder[] = [];
  freightOrderTitle = '';
  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager) { 
      
  }

  ngOnInit(): void {
  }

  @Input() set loadFreightOrders$(observable: Observable<FreightOrder[]>) {
    this.subscriptionManager.manage(observable.subscribe(freightOrders => {
     
      this.freightOrders = freightOrders.map(freightOrder => {
        freightOrder.volumeGross.value = parseFloat(freightOrder?.volumeGross?.value.toFixed(2));
        freightOrder.isEdit = true;
        return freightOrder
      });
      this.freightOrderTitle = `Freight Orders in Trip (${this.freightOrders.length})`;
    }));
  }

  editFreightOrder(freightOrder: any) {
    freightOrder.isEdit = false;
  }

}

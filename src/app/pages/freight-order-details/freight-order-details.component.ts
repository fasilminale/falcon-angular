import { Component, Inject, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FreightOrder } from 'src/app/models/freight-order/freight-order-model';
import { SubscriptionManager, SUBSCRIPTION_MANAGER } from 'src/app/services/subscription-manager';
import { NumberFormatter } from 'src/app/utils/number-formatter';

@Component({
  selector: 'app-freight-order-details',
  templateUrl: './freight-order-details.component.html',
  styleUrls: ['./freight-order-details.component.scss']
})
export class FreightOrderDetailsComponent implements OnInit {

  displayedColumns: string[] = ['freightOrderNumber', 'tmsLoadId', 'shippingPoint', 'warehouse', 'customerCategory', 'sequence', 'stopId', 'stopReferenceID', 'destination', 'grossWeight', 'volume', 'pallets', 'actions'];


  freightOrders: FreightOrder[] = [];
  freightOrderTitle = '';
  totalGrossWeight = 0;
  totalVolume = 0;
  totalPalletCount = 0;

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager) {

  }

  ngOnInit(): void {
  }

  @Input() set loadFreightOrders$(observable: Observable<FreightOrder[]>) {
    this.subscriptionManager.manage(observable.subscribe(freightOrders => {

      this.freightOrders = freightOrders.map(freightOrder => {
        freightOrder.volumeGross.value = parseFloat(freightOrder?.volumeGross?.value.toFixed(2));
        freightOrder.isEdit = true;
        return freightOrder;
      });
      this.freightOrderTitle = `Freight Orders in Trip (${this.freightOrders.length})`;
      this.totalGrossWeight = this.getTotalGrossWeight();
      this.totalVolume = this.getTotalVolume();
      this.totalPalletCount = this.getTotalPalletCount();
    }));
  }

  getTotalGrossWeight(): number{
    let totalGrossWeight = 0;
    this.freightOrders.forEach(fo => {
      totalGrossWeight += fo?.weightGross?.value;
    });
    return NumberFormatter.truncateData(totalGrossWeight);
  }

  getTotalVolume(): number{
    let totalVolume = 0;
    this.freightOrders.forEach(fo => {
      totalVolume += fo?.volumeGross?.value;
    });
    return NumberFormatter.truncateData(totalVolume);
  }

  getTotalPalletCount(): number{
    this.freightOrders.forEach(fo => {
      fo.palletCount = this.getPalletQuantity(fo?.volumeGross?.value);
    });

    return NumberFormatter.truncateData(this.freightOrders.reduce((i, fo) => {
       return i + fo.palletCount;
    }, 0));

  }

  editFreightOrder(freightOrder: any): void {
    freightOrder.isEdit = false;
  }

  getPalletQuantity(inputFt3: number): number {
    return NumberFormatter.truncateData((inputFt3 / 60));
  }


}

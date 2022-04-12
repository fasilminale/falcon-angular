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

  displayedColumns: string[] = ['freightOrderNumber', 'tmsLoadId', 'warehouse', 'sequence', 'stopId', 'destination', 'grossWeight', 'volume', 'pallets', 'actions'];


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
      totalGrossWeight += fo.weightGross.value;
    });
    return totalGrossWeight;
  }

  getTotalVolume(): number{
    let totalVolume = 0;
    this.freightOrders.forEach(fo => {
      totalVolume += fo.volumeGross.value;
    });
    return totalVolume;
  }

  getTotalPalletCount(): number{
    let totalPalletCount = 0;
    this.freightOrders.forEach(fo => {
     totalPalletCount += this.getPalletQuantity(fo.volumeGross.value);
    });
    return totalPalletCount;
  }

  editFreightOrder(freightOrder: any) {
    freightOrder.isEdit = false;
  }

  getPalletQuantity(inputFt3: number): number {
    return this.truncateData((inputFt3 / 60));
  }

  /**
   * Truncates data to the nearest 3rd decimal place and rounds up.
   * @param inputData - The data to be truncated.
   */
  truncateData(inputData: number): number {
    if (this.getNumDecimalPlaces(inputData) > 3) {
      return (Math.round((inputData + Number.EPSILON) * 1000) / 1000);
    } else {
      return inputData;
    }
  }

  /**
   * Calculates the number of decimal places in a number from a number or string including scientific notation.
   * @param num - Number of String to be analysed
   * @private
   */
  getNumDecimalPlaces(num: number | string): number {
    const match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match) {
      return 0;
    }
    return Math.max(
      0,
      // Number of digits right of decimal point.
      (match[1] ? match[1].length : 0)
      // Adjust for scientific notation.
      - (match[2] ? +match[2] : 0));
  }

}

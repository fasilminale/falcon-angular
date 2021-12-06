import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-freight-order-details',
  templateUrl: './freight-order-details.component.html',
  styleUrls: ['./freight-order-details.component.scss']
})
export class FreightOrderDetailsComponent implements OnInit {



  freightOrders: any[] = [];
  freightOrderTitle = '';
  constructor() { 
  
  }

  ngOnInit(): void {
    this.freightOrderTitle = `Freight Orders in Trip (${this.freightOrders.length})`
  }
}

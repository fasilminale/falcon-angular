import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { FreightOrder } from 'src/app/models/freight-order/freight-order-model';
import { FalconTestingModule } from 'src/app/testing/falcon-testing.module';

import { FreightOrderDetailsComponent } from './freight-order-details.component';

describe('FreightOrderDetailsComponent', () => {
  let component: FreightOrderDetailsComponent;
  let fixture: ComponentFixture<FreightOrderDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      declarations: [ FreightOrderDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FreightOrderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('edit freight orders', () => {
    const freightOrder = {
      isEdit: true
    };
    component.editFreightOrder(freightOrder);
    expect(freightOrder.isEdit).toBe(false);
   });

  describe('when freight orders are loaded', () => {
    let loadFreightOrders$: Subject<FreightOrder[]>;
    beforeEach(() => {
      loadFreightOrders$ = new Subject();
      component.loadFreightOrders$ = loadFreightOrders$.asObservable();
    });

    it('should update freight orders array', done => {
      loadFreightOrders$.subscribe(() => {
        expect(component.freightOrders.length).toBe(1);
        done();
      });
      loadFreightOrders$.next([
        {
          freightOrderId: 'TestId',
          volumeGross: {
            value: 234.345345
          }
        } as FreightOrder
      ]);
    });

    it('should set total volume, weight and pallet count.', done => {
       loadFreightOrders$.subscribe(() => {
         expect(component.totalVolume).toBe(350.09);
         expect(component.freightOrders[0].palletCount).toBe(1.667);
         expect(component.freightOrders[1].palletCount).toBe(3.334);
         expect(component.freightOrders[2].palletCount).toBe(0.834);
         expect(component.totalGrossWeight).toBe(350.092);
         expect(component.totalPalletCount).toBe(5.835);
         done();
       });
       loadFreightOrders$.next([
        {
           freightOrderId: 'TestId1',
           volumeGross: {
             value: 100.012
           },
           weightGross: {
             value: 100.012
           }
         } as FreightOrder,
         {
           freightOrderId: 'TestId2',
           volumeGross: {
             value: 200.023
           },
           weightGross: {
             value: 200.023
           }
         } as FreightOrder,
         {
           freightOrderId: 'TestId3',
           volumeGross: {
             value: 50.0567
           },
           weightGross: {
             value: 50.0567
           }
         } as FreightOrder
       ]);
     });
  });
});

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
  });


});

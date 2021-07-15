import {ComponentFixture, TestBed} from '@angular/core/testing';
import {InvoiceCreatePageComponent} from './invoice-create-page.component';
import {HttpTestingController} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {InvoiceDetailPageComponent} from '../invoice-detail-page/invoice-detail-page.component';
import {TimeService} from '../../services/time-service';
import {FalconTestingModule} from '../../testing/falcon-testing.module';

describe('InvoiceCreatePageComponent', () => {
  let component: InvoiceCreatePageComponent;
  let fixture: ComponentFixture<InvoiceCreatePageComponent>;
  let http: HttpTestingController;
  let time: TimeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FalconTestingModule,
        RouterTestingModule,
      ],
      declarations: [InvoiceDetailPageComponent],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    time = TestBed.inject(TimeService);
    fixture = TestBed.createComponent(InvoiceDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

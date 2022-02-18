import {FilterService} from './filter-service';
import {TestBed} from '@angular/core/testing';
import {AppModule} from '../app.module';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {environment} from '../../environments/environment';

describe('Storage Service', () => {
  let service: FilterService;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule, HttpClientTestingModule]
    }).compileComponents();

    service = TestBed.inject(FilterService);
    http = TestBed.inject(HttpTestingController);
    http.expectOne(`${environment.baseServiceUrl}/v1/invoiceStatuses`).flush([]);
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});

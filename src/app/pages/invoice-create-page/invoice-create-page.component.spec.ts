import {ComponentFixture, TestBed} from '@angular/core/testing';
import {InvoiceCreatePageComponent} from './invoice-create-page.component';
import {HttpTestingController} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {TimeService} from '../../services/time-service';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {UserService} from '../../services/user-service';
import {of} from 'rxjs';

describe('InvoiceCreatePageComponent', () => {
  let component: InvoiceCreatePageComponent;
  let fixture: ComponentFixture<InvoiceCreatePageComponent>;
  let http: HttpTestingController;
  let time: TimeService;
  let userService: UserService;

  const userInfo = {
    firstName: 'test',
    lastName: 'user',
    email: 'test@test.com',
    uid: '12345',
    role: 'FAL_INTERNAL_TECH_ADIMN'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FalconTestingModule,
        RouterTestingModule,
      ],
      declarations: [InvoiceCreatePageComponent],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    time = TestBed.inject(TimeService);
    userService = TestBed.inject(UserService);
    spyOn(userService, 'getUserInfo').and.returnValue(of(userInfo));
    fixture = TestBed.createComponent(InvoiceCreatePageComponent);
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

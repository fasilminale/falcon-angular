import {ComponentFixture, TestBed} from '@angular/core/testing';
import {InvoiceCreatePageComponent} from './invoice-create-page.component';
import {HttpTestingController} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {TimeService} from '../../services/time-service';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {UserService} from '../../services/user-service';
import {of} from 'rxjs';
import {FormBuilder} from '@angular/forms';
import {UserInfoModel} from '../../models/user-info/user-info-model';

describe('InvoiceCreatePageComponent', () => {
  let component: InvoiceCreatePageComponent;
  let fixture: ComponentFixture<InvoiceCreatePageComponent>;
  let http: HttpTestingController;
  let time: TimeService;
  let userService: UserService;

  const userInfo: UserInfoModel = new UserInfoModel({
    firstName: 'test',
    lastName: 'user',
    email: 'test@test.com',
    role: 'FAL_INTERNAL_TECH_ADIMN',
    permissions: []
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FalconTestingModule,
        RouterTestingModule,
      ],
      providers: [FormBuilder],
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

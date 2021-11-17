import {RoleGuard} from './role-guard';
import {of} from 'rxjs';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UserService} from '../../services/user-service';
import {WebServices} from '../../services/web-services';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {UserInfoModel} from '../../models/user-info/user-info-model';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRoute, Router} from '@angular/router';

describe('RoleGuard', () => {
  const writeUser = new UserInfoModel({
    uid: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'FAL_INTERNAL_WRITE',
    permissions: ['falAllowInvoiceWrite']
  });

  const techAdminUser = new UserInfoModel({
    uid: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'FAL_INTERNAL_TECH_ADMIN',
    permissions: ['falRestrictInvoiceWrite']
  });

  let router: any;
  let activatedRoute: any;
  let userService: UserService;
  let guard: RoleGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        MatDialog,
        Overlay,
        MatDialogModule,
        WebServices,
        UserService,
        { provide: ActivatedRoute,
          useValue: {
            data: {
              permissions: [ 'falAllowInvoiceWrite' ]
            }
          }
        }
      ],
      imports: [
        FormsModule, ReactiveFormsModule , MatDialogModule, HttpClientTestingModule, RouterTestingModule.withRoutes([])
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);

  });

  it('should instantiate service', fakeAsync(() => {
    spyOn(userService, 'getUserInfo').and.returnValue(of(writeUser));
    guard = new RoleGuard(router, userService);

    expect(guard).toBeTruthy();

    tick(100);
  }));

  it('should route if unguarded', () => {
    spyOn(userService, 'getUserInfo').and.returnValue(of(writeUser));
    guard = new RoleGuard(router, userService);
    guard.canActivate(activatedRoute, router).then(result => {
      expect(result).toBeTruthy();
    });
  });

  it('should not route if guarded', () => {
    spyOn(userService, 'getUserInfo').and.returnValue(of(techAdminUser));
    guard = new RoleGuard(router, userService);
    guard.canActivate(activatedRoute, router).then(result => {
      expect(result).toBeFalsy();
    });
  });
});

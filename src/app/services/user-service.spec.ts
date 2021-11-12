import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import { WebServices } from './web-services';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { UserService } from './user-service';

describe('UserService', () => {
  let userService: UserService;
  let web: WebServices;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        WebServices,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    userService = TestBed.inject(UserService);
    web = TestBed.inject(WebServices);
  });

  it('should create', () => {
    expect(userService).toBeTruthy();
  });

  it('should get user info', async () => {
    spyOn(web, 'httpGet').and.returnValue(of(''));
    await userService.getUserInfo().toPromise();
    expect(web.httpGet).toHaveBeenCalled();
  });

  it('should get cached user info', fakeAsync( () => {
    spyOn(web, 'httpGet').and.returnValue(of(''));
    userService.getUserInfo().toPromise();
    tick();
    userService.getUserInfo().toPromise();
    expect(web.httpGet).toHaveBeenCalledTimes(1);
  }));
});

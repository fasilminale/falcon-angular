import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import { WebServices } from './web-services';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { UserService } from './user-service';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';

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
        UntypedFormBuilder,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    userService = TestBed.inject(UserService);
    web = TestBed.inject(WebServices);
  });

  it('should create', () => {
    expect(userService).toBeTruthy();
  });

  it('should get controlGroupState', async () => {
    expect(userService.controlGroupState).toBeTruthy();
  });

  it('controlGroupState should accept commas and spaces', async () => {
    const controlGroupState = userService.controlGroupState;
    controlGroupState.controls.control.setValue('foo, bar');
    expect(controlGroupState.valid).toEqual(true);
  });

  it('should set controlGroupState', async () => {
    const cg = new UntypedFormGroup({});
    userService.controlGroupState = cg;
    expect(userService.controlGroupState).toBe(cg);
  });

  it('should get same controlGroupState', async () => {
    const cg = userService.controlGroupState;
    userService.controlGroupState = cg;
    expect(userService.controlGroupState).toBe(cg);
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

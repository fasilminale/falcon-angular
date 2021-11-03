import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';
import { UserInfoModel } from './user-info-model';

describe('Project Model Tests', () => {

  const expectedEmptyUserInfo: { firstName: string; lastName: string; uid: string; role: string; email: string } = {
    firstName: '',
    lastName: '',
    email: '',
    uid: '',
    role: ''
  };

  const expectedUserInfo: { firstName: string; lastName: string; uid: string; role: string; email: string } = {
    firstName: 'test',
    lastName: 'user',
    email: 'test@test.com',
    uid: '',
    role: 'FAL_INTERNAL_WRITE'
  };

  const userInfoJson = {
    firstName: 'test',
    lastName: 'user',
    email: 'test@test.com',
    uid: '',
    role: 'FAL_INTERNAL_WRITE'
  };

  let testEmptyUserInfo: UserInfoModel;
  let testUserInfo: UserInfoModel;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ AppModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();

    testEmptyUserInfo = new UserInfoModel();
    testUserInfo = new UserInfoModel( userInfoJson );
  });

  function compareUserInfo(userInfo1: UserInfoModel, userInfo2: UserInfoModel): void {
    expect(userInfo1.uid).toEqual(userInfo2.uid);
    expect(userInfo1.firstName).toEqual(userInfo2.firstName);
    expect(userInfo1.lastName).toEqual(userInfo2.lastName);
    expect(userInfo1.role).toEqual(userInfo2.role);
  }

  it('empty user should equal test model', () => {
    expect(testEmptyUserInfo).not.toBeNull();
    compareUserInfo(testEmptyUserInfo, expectedEmptyUserInfo as UserInfoModel);
  });

  it('expected user should equal test model', () => {
    expect(testUserInfo).not.toBeNull();
    compareUserInfo(testUserInfo, expectedUserInfo as UserInfoModel);
  });
});

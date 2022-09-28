import {ENV, EnvironmentService} from './environment-service';
import {WebServices} from '../web-services';
import {TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {AppModule} from '../../app.module';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {Router} from '@angular/router';

describe('EnvironmentService', () => {

  let service: EnvironmentService;
  let router: Router;
  let webServices: WebServices;
  let http: HttpTestingController;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, AppModule, HttpClientTestingModule]
    });
    await TestBed.compileComponents();
    webServices = TestBed.inject(WebServices);
    router = TestBed.inject(Router);
    http = TestBed.inject(HttpTestingController);
    service = new EnvironmentService(webServices);
  });


  describe('getGCPStorageLink', () => {
    it('should return gcpstoragelink for QA', () => {
      expect(service.getGCPStorageLink('https://elm-qa.cardinalhealth.net')).toEqual('https://storage.googleapis.com/elm-chile/master-data-templates/qa');
    });

    it('should return gcpstoragelink for PROD', () => {
      expect(service.getGCPStorageLink('https://elm.cardinalhealth.net')).toEqual('https://storage.googleapis.com/elm-chile-prod/master-data-templates');
    });

    it('should return gcpstoragelink as DEV url for any other origin', () => {
      expect(service.getGCPStorageLink('https://elm-dev.cardinalhealth.net')).toEqual('https://storage.googleapis.com/elm-chile/master-data-templates/dev');
    });

  });

  describe('getInDev', () => {
    it('should return true when origin is dev', () => {
      expect(service.getInDev('https://elm-dev.cardinalhealth.net')).toBeTrue();
    });

    it('should return true when origin is local', () => {
      expect(service.getInDev('http://localhost:4200')).toBeTrue();
    });

    it('should return false when not in a dev environment', () => {
      expect(service.getInDev('https://elm-qa.cardinalhealth.net')).toBeFalse();
    });
  });


  describe('getInLocal', () => {
    it('should return true when origin is local', () => {
      expect(service.getInLocal('http://localhost:4200')).toBeTrue();
    });

    it('should return false when origin is dev', () => {
      expect(service.getInLocal('https://elm-dev.cardinalhealth.net')).toBeFalse();
    });

    it('should return false when not in a dev environment', () => {
      expect(service.getInLocal('https://elm-qa.cardinalhealth.net')).toBeFalse();
    });
  });

  describe('getContextRoot', () => {
    it('should return / when origin is local', () => {
      expect(service.getContextRoot('http://localhost:4200')).toEqual('/');
    });

    it('should return /chile when origin is dev', () => {
      expect(service.getContextRoot('https://elm-dev.cardinalhealth.net')).toEqual('/falcon');
    });
  });

  describe('get featureFlags', () => {
    it('should pull from local storage', () => {
      spyOn(localStorage, 'getItem').and.returnValue('{"flag":true}');
      expect(service.featureFlags).toEqual({flag: true});
    });

    it('should return an empty object if feature flags are not found', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      expect(service.featureFlags).toEqual({});
    });
  });

  describe('set featureFlags', () => {
    it('should store in local storage', () => {
      const setItemSpy = spyOn(localStorage, 'setItem').and.stub();
      service.featureFlags = {flag: true};
      expect(setItemSpy).toHaveBeenCalled();
    });
  });

});

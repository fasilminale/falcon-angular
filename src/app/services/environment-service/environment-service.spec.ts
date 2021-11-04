import {ENV, EnvironmentService} from './environment-service';

describe('EnvironmentService', () => {

  let service: EnvironmentService;

  beforeEach(() => {
    service = new EnvironmentService();
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

});

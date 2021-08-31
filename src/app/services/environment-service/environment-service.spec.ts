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

});

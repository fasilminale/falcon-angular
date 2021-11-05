import {TestBed} from '@angular/core/testing';

import {WindowService} from './window-service';
import {AppModule} from '../../app.module';
import {EnvironmentService} from '../environment-service/environment-service';
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';

describe('WindowService', () => {
  let service: WindowService;
  let environmentService: EnvironmentService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule, RouterTestingModule]
    });
    service = TestBed.inject(WindowService);
    environmentService = TestBed.inject(EnvironmentService);
    router = TestBed.inject(Router);

    spyOn(window, 'open').and.stub();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('openInNewWindow', () => {
    it('should open a new window with context root /', () => {
      spyOn(environmentService, 'getContextRoot').and.returnValue('/');

      service.openInNewWindow('invoices');
      expect(window.open).toHaveBeenCalledWith('/invoices', '_blank');
    });

    it('should open a new window with context root /falcon', () => {
      spyOn(environmentService, 'getContextRoot').and.returnValue('/falcon');

      service.openInNewWindow('invoices');
      expect(window.open).toHaveBeenCalledWith('/falcon/invoices', '_blank');
    });

    it('should open a new window with context root /falcon and multiple components', () => {
      spyOn(environmentService, 'getContextRoot').and.returnValue('/falcon');

      service.openInNewWindow('F00001');
      expect(window.open).toHaveBeenCalledWith('/falcon/F00001', '_blank');
    });
  });

});

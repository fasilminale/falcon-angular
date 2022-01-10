import {TestBed} from '@angular/core/testing';
import {FalconTestingModule} from '../testing/falcon-testing.module';
import {UtilService} from './util-service';
import {WebServices} from './web-services';
import {TimeService} from './time-service';
import {BuildInfo, BuildInfoService} from './build-info-service';
import {of} from 'rxjs';


describe('BuildInfoService', () => {

  const TEST_DATA: BuildInfo = {
    git: {
      branch: 'BRANCH',
      commit: {
        id: 'COMMIT ID',
        time: '2022-01-10T14:58:58Z',
      }
    }
  };

  let web: WebServices;
  let util: UtilService;
  let time: TimeService;
  let buildInfoService: BuildInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FalconTestingModule],
    });
    web = TestBed.inject(WebServices);
    spyOn(web, 'httpGet').and.returnValue(of(TEST_DATA));
    util = TestBed.inject(UtilService);
    spyOn(util, 'openGenericModal').and.returnValue(of(true));
    time = TestBed.inject(TimeService);
    buildInfoService = new BuildInfoService(web, util, time);
  });

  it('should create', () => {
    expect(buildInfoService).toBeTruthy();
  });

  it('getBuildInfo() should call web service', async () => {
    const result = await buildInfoService.getBuildInfo().toPromise();
    expect(result).toBe(TEST_DATA);
  });

  it('openBuildInfoModal() should call web service and open modal', async () => {
    await buildInfoService.openBuildInfoModal().toPromise();
    expect(web.httpGet).toHaveBeenCalled();
    expect(util.openGenericModal).toHaveBeenCalled();
  });

});

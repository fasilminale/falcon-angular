import {TestBed} from '@angular/core/testing';
import {FalconTestingModule} from '../../testing/falcon-testing.module';
import {StatusUtil} from './status-model';

describe('Status Model Tests', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FalconTestingModule],
    }).compileComponents();
  });

  it('StatusUtil#hasKey should check given status', () => {
    const status = {key: 'TestKey', label: 'Test Label'};
    const result = StatusUtil.hasKey('TestKey', status);
    expect(result).toBeTrue();
  });

});

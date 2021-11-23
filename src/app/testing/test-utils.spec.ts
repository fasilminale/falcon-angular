import Spy = jasmine.Spy;
import {TestBed} from '@angular/core/testing';
import {FalconTestingModule} from './falcon-testing.module';
import {MockParamMap} from './test-utils';

export function asSpy(fn: any): Spy {
  return fn as Spy;
}

describe('test-utils-spec.ts', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FalconTestingModule],
    });
  });

  it('should return keys from internal map', () => {
    const mockParams = new MockParamMap();
    mockParams.map.set('key1', []);
    mockParams.map.set('key2', []);
    expect(mockParams.keys).toEqual(['key1', 'key2']);
  });

  it('should have key from internal map', () => {
    const mockParams = new MockParamMap();
    mockParams.map.set('key1', []);
    expect(mockParams.has('key1')).toBeTrue();
  });

});

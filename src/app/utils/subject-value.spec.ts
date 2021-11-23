import {TestBed} from '@angular/core/testing';
import {FalconTestingModule} from '../testing/falcon-testing.module';
import {SubjectValue} from './subject-value';

describe('SubjectValue', () => {

  let subjectValue: SubjectValue<number>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FalconTestingModule],
    });
    subjectValue = new SubjectValue(0);
  });

  it('should create instance', () => {
    expect(subjectValue).toBeTruthy();
  });

  it('should have initial value', () => {
    expect(subjectValue.value).toBe(0);
  });

  it('should be able to be set', () => {
    subjectValue.value = 135;
    expect(subjectValue.value).toBe(135);
  });

  it('should be observable', done => {
    subjectValue.asObservable().subscribe(result => {
      expect(result).toBe(643);
      done();
    });
    subjectValue.value = 643;
  });

});

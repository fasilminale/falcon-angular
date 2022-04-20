import {TestBed} from '@angular/core/testing';
import {FalconTestingModule} from '../testing/falcon-testing.module';
import {EllipsisPipe} from './ellipsis-pipe';

describe('EllipsisPipe Tests', () => {
  let ellipsisPipe: EllipsisPipe;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FalconTestingModule],
      providers: [EllipsisPipe],
    }).compileComponents();
    ellipsisPipe = TestBed.inject(EllipsisPipe);
  });

  it('should create', () => {
    expect(ellipsisPipe).toBeTruthy();
  });

  it('Should parse the date', () => {
    const result = ellipsisPipe.transform('fakeemail@test.com', 10);
    expect(result).toEqual('fakeemail@...');
  });
});

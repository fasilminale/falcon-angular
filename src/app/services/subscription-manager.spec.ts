import {TestBed} from '@angular/core/testing';
import {RealSubscriptionManager} from './subscription-manager';
import {of, Subscription} from 'rxjs';
import {FalconTestingModule} from '../testing/falcon-testing.module';

describe('RealSubscriptionManager', () => {

  let realSubscriptionManager: RealSubscriptionManager;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FalconTestingModule]
    });
    realSubscriptionManager = new RealSubscriptionManager();
  });

  it('should create.', () => {
    expect(realSubscriptionManager).toBeTruthy();
  });

  it('should start empty.', () => {
    expect(realSubscriptionManager.subscriptions).toBeTruthy();
    expect(realSubscriptionManager.subscriptions.length).toEqual(0);
  });

  describe('given a subscription.', () => {
    let subscription: Subscription;
    beforeEach(() => {
      subscription = of(true).subscribe(() => true);
      realSubscriptionManager.manage(subscription);
    });

    it('should store subscription.', () => {
      expect(realSubscriptionManager.subscriptions.length).toEqual(1);
    });

    it(', when ngOnDestroy called, should unsubscribe.', () => {
      spyOn(subscription, 'unsubscribe').and.callThrough();
      realSubscriptionManager.ngOnDestroy();
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

  });

});

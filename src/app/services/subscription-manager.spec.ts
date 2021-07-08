import {TestBed} from '@angular/core/testing';
import {SubscriptionManager} from './subscription-manager';
import {of, Subscription} from 'rxjs';

describe('SubscriptionManager', () => {

  let subscriptionManager: SubscriptionManager;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      providers: [SubscriptionManager],
      schemas: []
    }).compileComponents();
    subscriptionManager = TestBed.inject(SubscriptionManager);
  });

  it('should create.', () => {
    expect(subscriptionManager).toBeTruthy();
  });

  it('should start empty.', () => {
    const subscriptions = subscriptionManager.getSubscriptions();
    expect(subscriptions).toBeTruthy();
    expect(subscriptions.length).toEqual(0);
  });

  describe('given a subscription.', () => {
    let subscription: Subscription;
    beforeEach(() => {
      subscription = of(true).subscribe(() => true);
      subscriptionManager.manage(subscription);
    });

    it('should store subscription.', () => {
      expect(subscriptionManager.getSubscriptions().length).toEqual(1);
    });

    it(', when ngOnDestroy called, should unsubscribe.', () => {
      spyOn(subscription, 'unsubscribe').and.callThrough();
      subscriptionManager.ngOnDestroy();
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

  });

});

import {Injectable, InjectionToken, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';

export const SUBSCRIPTION_MANAGER = new InjectionToken<SubscriptionManager>('SubscriptionManager');

/* INTERFACE */
/** This service class handles unsubscribing from any subscriptions given to it. */
export interface SubscriptionManager extends OnDestroy {

  /** Get a read only view of the subscriptions being managed by the service. */
  readonly subscriptions: readonly Subscription[];

  /** Give the service subscription(s) to manage. */
  manage(...newSubs: Array<Subscription>): void;
}

/* REAL IMPLEMENTATION */
@Injectable()
export class RealSubscriptionManager implements SubscriptionManager, OnDestroy {

  static PROVIDER = {provide: SUBSCRIPTION_MANAGER, useClass: RealSubscriptionManager};

  private subs: Array<Subscription> = [];

  get subscriptions(): readonly Subscription[] {
    return this.subs;
  }

  manage(...newSubs: Array<Subscription>): void {
    newSubs.forEach(sub => this.subs.push(sub));
  }

  ngOnDestroy(): void {
    const subsToUnsubscribe = this.subs;
    this.subs = [];
    subsToUnsubscribe.forEach(sub => sub.unsubscribe());
  }
}

import {Injectable, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';

/**
 * This service class handles unsubscribing from any subscriptions given to it.
 */
@Injectable()
export class SubscriptionManager implements OnDestroy {

  private subscriptions: Array<Subscription> = [];

  public constructor() {
  }

  /**
   * Get a read only view of the subscriptions being managed by the service.
   */
  public getSubscriptions(): readonly Subscription[] {
    return this.subscriptions;
  }

  /**
   * Give the service subscription(s) to manage. The service will then unsubscribe when the ngOnDestroy event is called.
   * @param subs the variable list of subscriptions to manage.
   */
  public manage(...subs: Array<Subscription>): void {
    subs.forEach(sub => this.subscriptions.push(sub));
  }

  /**
   * Unlike ngOnInit, ngOnDestroy is called for each injected service when a component is destroyed.
   */
  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}

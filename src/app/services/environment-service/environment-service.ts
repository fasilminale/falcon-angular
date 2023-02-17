import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {WebServices} from '../web-services';
import {environment} from '../../../environments/environment';

export enum ENV { DEV, QA, PROD, LOCAL };

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  environment: Record<string, ENV> = {
    'http://localhost:4200': ENV.LOCAL,
    'https://elm-dev.cardinalhealth.net': ENV.DEV,
    'https://elm-qa.cardinalhealth.net': ENV.QA,
    'https://elm.cardinalhealth.net': ENV.PROD,
  };
  featureFlagsSubject = new BehaviorSubject(false);

  constructor(private webServices: WebServices) {
  }

  /**
   * Gets the Record of featureFlags stored in local storage, if not available returns an empty Record as
   * featureFlags have not ben set for the machine.
   */
  get featureFlags(): Record<string, boolean> {
    const localStoredFeatureFlagsString = localStorage.getItem('featureFlags');
    if (localStoredFeatureFlagsString != null) {
      return (JSON.parse(localStoredFeatureFlagsString));
    }
    return {};
  }

  /**
   * Stored featureFlags in local storage.
   * @param featureFlags - the Record of feature flags to store.
   */
  set featureFlags(featureFlags: Record<string, boolean>) {
    localStorage.setItem('featureFlags', JSON.stringify(featureFlags));
  }

  getGCPStorageLink(origin: string = window.origin): string {
    switch (this.environment[origin]) {
      case ENV.QA: return 'https://storage.googleapis.com/elm-chile/master-data-templates/qa';
      case ENV.PROD: return 'https://storage.googleapis.com/elm-chile-prod/master-data-templates';
      default: return 'https://storage.googleapis.com/elm-chile/master-data-templates/dev';
    }
  }

  showFeature(featureToCheck: string, origin: string = window.origin): boolean {
    return this.getInDev(origin) || this.featureFlags[featureToCheck];
  }

  getInDev(origin: string = window.origin): boolean {
    return (this.environment[origin] === ENV.DEV || this.getInLocal(origin));
  }

  getInLocal(origin: string = window.origin): boolean {
    return this.environment[origin] === ENV.LOCAL;
  }

  getContextRoot(origin: string = window.origin): string {
    if (this.getInLocal(origin)) {
      return '/';
    }
    return '/falcon';
  }

  async getFeatures(): Promise<any> {
    const features = await this.webServices.httpGet(`${environment.baseServiceUrl}/v1/features`, true).toPromise();
    if (features) {
      this.featureFlags = features;
      this.featureFlagsSubject.next(true);
    }
    debugger;
    return Promise.resolve();
  }
}

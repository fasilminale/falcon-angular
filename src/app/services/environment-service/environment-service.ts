import { Injectable } from '@angular/core';

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

  getGCPStorageLink(origin: string = window.origin): string {
    switch (this.environment[origin]) {
      case ENV.QA: return 'https://storage.googleapis.com/elm-chile/master-data-templates/qa';
      case ENV.PROD: return 'https://storage.googleapis.com/elm-chile-prod/master-data-templates';
      default: return 'https://storage.googleapis.com/elm-chile/master-data-templates/dev';
    }
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
}

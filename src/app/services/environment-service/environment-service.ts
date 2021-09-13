export enum ENV { DEV, QA, PROD, LOCAL };

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
}
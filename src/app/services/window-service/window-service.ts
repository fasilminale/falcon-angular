import {Injectable} from '@angular/core';
import {EnvironmentService} from '../environment-service/environment-service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class WindowService {

  constructor(private environmentService: EnvironmentService,
              private router: Router) {
  }

  openInNewWindow(url: string, queryParams?: any): void {
    const urlComponents = url.split('/');
    const serializedUrl = this.router.serializeUrl(
      this.router.createUrlTree([
        `${this.environmentService.getContextRoot()}`,
        ...urlComponents,
      ], {queryParams})
    );
    window.open(serializedUrl, '_blank');
  }
}

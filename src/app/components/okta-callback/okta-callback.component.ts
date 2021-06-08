import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { OktaAuthService } from '@okta/okta-angular';
import {LoadingService} from '../../services/loading-service';
import {ErrorService} from '../../services/error-service';

@Component({
  selector: 'app-okta-callback-component',
  templateUrl: './okta-callback.component.html'
})
export class OktaCallbackComponent implements OnInit {
  constructor(private okta: OktaAuthService,
              private router: Router,
              private route: ActivatedRoute,
              private loadingService: LoadingService,
              private errorService: ErrorService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.loadingService.showLoading('');
      const tokens = await this.okta.token.parseFromUrl();
      this.okta.tokenManager.setTokens(tokens.tokens);
      setTimeout( async () => {
        const isAuthenticated = await this.okta.isAuthenticated();
        if (isAuthenticated) {
          this.router.navigate([this.okta.getOriginalUri()]).then();
        } else {
          this.errorService.addError({status: '401', error: {message: 'An error occurred during login. Please try again'}});
        }
        this.loadingService.hideLoading();
      }, 500);
    } catch (e) {
      console.log(e);
      this.errorService.addError({status: '401', error: {message: 'An error occurred during login. Please try again'}});
    }
  }
}

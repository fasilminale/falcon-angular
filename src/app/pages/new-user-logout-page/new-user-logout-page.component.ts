import {Component, Inject} from '@angular/core';
import {Router} from '@angular/router';
import {OktaAuthService} from '@okta/okta-angular';

@Component({
  selector: 'app-new-user-logout-page',
  templateUrl: './new-user-logout-page.component.html',
  styleUrls: ['./new-user-logout-page.component.scss']
})
export class NewUserLogoutPageComponent {

  constructor(private router: Router,
              private oktaService: OktaAuthService) {

  }

  logout(): void {
    this.oktaService.signOut().then(() => {
      this.router.navigate(['/logged-out']).then();
    });
  }

}

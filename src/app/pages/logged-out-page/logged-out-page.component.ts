import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {OktaAuthService} from "@okta/okta-angular";

@Component({
  selector: 'app-logged-out-page',
  templateUrl: './logged-out-page.component.html',
  styleUrls: ['./logged-out-page.component.scss']
})
export class LoggedOutPageComponent implements OnInit {

  constructor(private oktaAuth: OktaAuthService) { }

  ngOnInit(): void {

  }

  login(): void {
    this.oktaAuth.signInWithRedirect({originalUri: '/invoices'}).then();
  }
}

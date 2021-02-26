import {Component, OnInit} from '@angular/core';
import {WebServices} from '../services/web-services';
import {environment} from '../../environments/environment';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';

@Component({
  selector: 'app-health-check',
  templateUrl: './health-check.component.html',
  styleUrls: ['./health-check.component.scss']
})
export class HealthCheckComponent implements OnInit {
  status = '(click)';

  constructor(private webService: WebServices) {
  }

  ngOnInit(): void {
  }

  callHealthCheck(): void {
    this.webService
      .httpGet<HttpResponse<never>>(`${environment.baseServiceUrl}/v1/health`)
      .subscribe(
        (result: HttpResponse<never>) => {
          console.log(result);
          // non-error responses route here
          this.status = 'PASS';
        },
        (errorResult: HttpErrorResponse) => {
          // error responses route here
          this.status = `FAIL (${errorResult.status}: ${errorResult.statusText})`;
        }
      );
  }

}

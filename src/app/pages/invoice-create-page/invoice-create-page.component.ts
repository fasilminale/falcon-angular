import {Component, OnInit} from '@angular/core';
import {UserService} from '../../services/user-service';
import {UserInfoModel} from '../../models/user-info/user-info-model';

@Component({
  selector: 'app-invoice-create-page',
  templateUrl: './invoice-create-page.component.html',
  styleUrls: ['./invoice-create-page.component.scss']
})
export class InvoiceCreatePageComponent implements OnInit {

  public userInfo: UserInfoModel | undefined;

  public constructor(public userService: UserService) {
  }

  public ngOnInit(): void {
    this.userService.getUserInfo().subscribe(userInfo => {
      this.userInfo = new UserInfoModel(userInfo);
    });
  }
}

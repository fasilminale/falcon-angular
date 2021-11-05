import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import { Injectable } from '@angular/core';
import { UserService } from '../../services/user-service';
import { UserInfoModel } from '../../models/user-info/user-info-model';

@Injectable()
export class RoleGuard implements CanActivate {

  constructor(private router: Router,
              private userService: UserService){
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.userService.getUserInfo().toPromise().then(result => {
      const userInfo = new UserInfoModel(result);
      const roles = route.data.roles as Array<string>;

      let allowed = false;

      for (const role of roles) {
        if (userInfo?.role === role ) {
          allowed = true;
          break;
        }
      }

      return allowed;
    });
  }
}

import {UserInfo} from '@elm/elm-styleguide-ui';

export interface FalUserInfo extends UserInfo {
  permissions: string[];
}

export class UserInfoModel implements FalUserInfo {
  private mFirstName = '';
  private mLastName = '';
  private mEmail = '';
  private mLogin = '';
  private mRole = '';
  private mPermissions: string[] = [];

  get firstName(): string {
    return this.mFirstName;
  }

  set firstName(value: string) {
    this.mFirstName = value;
  }

  get lastName(): string {
    return this.mLastName;
  }

  set lastName(value: string) {
    this.mLastName = value;
  }

  get role(): string {
    return this.mRole;
  }

  set role(value: string) {
    this.mRole = value;
  }

  get email(): string {
    return this.mEmail;
  }

  set email(value: string) {
    this.mEmail = value;
  }

  get login(): string {
    return this.mLogin;
  }

  set login(value: string) {
    this.mLogin = value;
  }

  get permissions(): string[] {
    return this.mPermissions;
  }

  set permissions(value: string[]) {
    this.mPermissions = value;
  }

  constructor(json?: any) {
    if (json?.login) {
      this.login = json.login;
    }

    if (json?.firstName) {
      this.firstName = json.firstName;
    }

    if (json?.lastName) {
      this.lastName = json.lastName;
    }

    if (json?.email) {
      this.email = json.email;
    }

    if (json?.role) {
      this.role = json.role;
    }

    if (json?.permissions) {
      this.permissions = json.permissions;
    }
  }

  hasPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.mPermissions.includes(permission));
  }
}

import {UserInfo} from '@elm/elm-styleguide-ui';

export class UserInfoModel implements UserInfo {

  private mFirstName = '';
  private mLastName = '';
  private mEmail = '';
  private mUid = '';
  private mRole = '';

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

  get uid(): string {
    return this.mUid;
  }
  set uid(value: string) {
    this.mUid = value;
  }

  constructor(json?: any) {
    if (json?.uid) {
      this.uid = json.uid;
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
  }
}

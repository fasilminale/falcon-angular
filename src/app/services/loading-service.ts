import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class LoadingService {
  loadingSubject = new BehaviorSubject(false);
  showLoading(): void {
    this.loadingSubject.next(true);
  }
  hideLoading(): void {
    this.loadingSubject.next(false);
  }
}

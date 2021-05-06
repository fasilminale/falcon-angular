import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class LoadingService {
  loadingSubject = new BehaviorSubject([false, '']);
  showLoading(label: string): void {
    this.loadingSubject.next([true, label]);
  }
  hideLoading(): void {
    this.loadingSubject.next([false, '']);
  }
}

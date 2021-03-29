import {Component, ElementRef, forwardRef, Input, OnInit, ViewChild} from '@angular/core';
import {FalControlValueAccessorComponent} from '../fal-control-value-accessor/fal-control-value-accessor.component';
import {NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-fal-file-input',
  template: `
    <input #childInput
           type="file"
           class="form-control"
           [accept]="accept"
           (change)="onChildInputChange($event)"
    />`,
  styleUrls: ['./fal-file-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FalFileInputComponent),
      multi: true
    },
  ]
})
export class FalFileInputComponent extends FalControlValueAccessorComponent<File> implements OnInit {

  @ViewChild('childInput') childInput?: ElementRef;
  @Input() accept: string = '';

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

  public onChildInputChange(event: any): void {
    this.value = event.target.files[0] as File;
  }

  public reset(): void {
    // @ts-ignore
    this.childInput?.nativeElement.value = '';
  }

}

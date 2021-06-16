import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {PaginationModel} from '../../models/PaginationModel';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  paginationModel: PaginationModel = new PaginationModel();
  @Input() label = 'Falcon Invoice Number, External Invoice Number or Vendor Number';
  @Input() value = '';

  @Output() submitEvent: EventEmitter<string> = new EventEmitter<string>();

  controlGroup = new FormGroup({
    control: new FormControl()
  });

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.controlGroup = this.fb.group({
        control: [null, [Validators.pattern('^[A-Za-z0-9]*$'), Validators.required]]
      }, {updateOn: 'submit'}
    );
  }

  submit(): void {
    this.submitEvent.emit(this.controlGroup.controls.control.value);
  }
}

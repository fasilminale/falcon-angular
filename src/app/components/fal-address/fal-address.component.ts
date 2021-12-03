import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
const { minLength, required } = Validators;

@Component({
  selector: 'app-fal-address',
  templateUrl: './fal-address.component.html',
  styleUrls: ['./fal-address.component.scss']
})
export class FalAddressComponent implements OnInit {

  shippingPointItems = [
    'Home',
    'Office'
  ];

  public _formGroup = new FormGroup({});

  @Input() set formGroup (newFormGroup: FormGroup) {
    newFormGroup.setControl('name', new FormControl('', [required]))
    newFormGroup.setControl('country', new FormControl('', [required]))
    newFormGroup.setControl('city', new FormControl('', [required]))
    newFormGroup.setControl('zipCode', new FormControl('', [required, minLength(5)]))
    newFormGroup.setControl('state', new FormControl('', [required]))
    newFormGroup.setControl('streetAddress', new FormControl('', [required]))
    newFormGroup.setControl('streetAddress2', new FormControl())
    newFormGroup.setControl('shippingPoint', new FormControl('', [required]))
    this._formGroup = newFormGroup;
    this._formGroup.disable();
  }

  @Input() showShippingItemField = true;

  constructor() { }

  ngOnInit(): void {
  }

}

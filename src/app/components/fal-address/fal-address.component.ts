import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
const { minLength} = Validators;

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
    newFormGroup.setControl('name', new FormControl())
    newFormGroup.setControl('country', new FormControl())
    newFormGroup.setControl('city', new FormControl())
    newFormGroup.setControl('zipCode', new FormControl('', [minLength(5)]))
    newFormGroup.setControl('state', new FormControl())
    newFormGroup.setControl('streetAddress', new FormControl())
    newFormGroup.setControl('streetAddress2', new FormControl())
    newFormGroup.setControl('shippingPoint', new FormControl())
    this._formGroup = newFormGroup;
    this._formGroup.disable();
  }

  @Input() showShippingItemField = true;

  constructor() { }

  ngOnInit(): void {
  }

}

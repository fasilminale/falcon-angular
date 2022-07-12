import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ShippingPointLocationSelectOption } from 'src/app/models/location/location-model';
import { SubscriptionManager, SUBSCRIPTION_MANAGER } from 'src/app/services/subscription-manager';

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
  private _editableFormArray = new FormArray([]);;
  @Input() addressType!: 'origin' | 'destination';
  @Input() destinationType?: string;
  @Output() originShippingPointChangeEvent = new EventEmitter<String>();
  public masterDataShippingPoints: Array<ShippingPointLocationSelectOption> = [];

  public nameControl = new FormControl('', [required]);
  public countryControl = new FormControl('', [required]);
  public cityControl = new FormControl('', [required]);
  public zipCodeControl = new FormControl('', [required, minLength(5)]);
  public stateControl = new FormControl('', [required]);
  public streetAddressControl = new FormControl('', [required]);
  public streetAddress2Control = new FormControl();
  public shippingPointControl = new FormControl('', [required]);
  public name2Control = new FormControl();
  public idCodeControl = new FormControl();

  @Input() set formGroup (newFormGroup: FormGroup) {
    newFormGroup.setControl('name', this.nameControl);
    newFormGroup.setControl('country', this.countryControl);
    newFormGroup.setControl('city', this.cityControl);
    newFormGroup.setControl('zipCode', this.zipCodeControl);
    newFormGroup.setControl('state', this.stateControl);
    newFormGroup.setControl('streetAddress', this.streetAddressControl);
    newFormGroup.setControl('streetAddress2', this.streetAddress2Control);
    newFormGroup.setControl('shippingPoint', this.shippingPointControl);
    newFormGroup.setControl('name2', this.name2Control);
    newFormGroup.setControl('idCode', this.idCodeControl);
    this._formGroup = newFormGroup;
    this._formGroup.disable();
  }

  @Input() set loadFilteredShippingPointLocations$(observable: Observable<Array<ShippingPointLocationSelectOption>>) {
    this.subscriptionManager.manage(observable.subscribe(spl => {
      this.masterDataShippingPoints = spl;
    }));
  }

  @Input() set loadAddress$(observable: Observable<any>) {
    this.subscriptionManager.manage(observable.subscribe(l => {
        this.nameControl?.setValue(l.name ? l.name: 'N/A');
        this.countryControl?.setValue(l.country ? l.country: this.validateField ? undefined : 'N/A');
        this.cityControl?.setValue(l.city ? l.city: 'N/A');
        this.zipCodeControl?.setValue(l.zipCode ? l.zipCode: this.validateField ? undefined : 'N/A');
        this.stateControl?.setValue(l.state ? l.state: 'N/A');
        this.streetAddressControl?.setValue(l.address ? l.address: 'N/A');
        this.streetAddress2Control?.setValue(l.address2 ? l.address2: 'N/A');
        this.shippingPointControl?.setValue(this.addressType === 'destination' ? 'N/A' : (l.shippingPoint ? l.shippingPoint : 'N/A'));
        if (this.addressType == undefined) {
          this.name2Control?.setValue(l.name2 ? l.name2: 'N/A');
          this.idCodeControl?.setValue(l.idCode ? l.idCode: 'N/A');
        }
        this._editableFormArray.clear();
        if (this.addressType == 'origin' || (this.addressType == 'destination' && this.destinationType == 'DC')) {
          this._editableFormArray.push(this.shippingPointControl);
        }
        if (this.addressType == 'destination' && this.destinationType == 'CUST') {
          this._editableFormArray.push(this.nameControl);
          this._editableFormArray.push(this.countryControl);
          this._editableFormArray.push(this.cityControl);
          this._editableFormArray.push(this.zipCodeControl);
          this._editableFormArray.push(this.stateControl);
          this._editableFormArray.push(this.streetAddressControl);
          this._editableFormArray.push(this.streetAddress2Control);
        }
    }))
  }
  
  @Input() set updateIsEditMode$(observable: Observable<boolean>) {
    this.subscriptionManager.manage(observable.subscribe(
      isEditMode => {
        isEditMode ? this._editableFormArray.enable() : this._editableFormArray.disable();
      }
    ));
  }

  @Input() showShippingItemField = true;
  @Input() validateField = true; // TODO: Temporary for FAL-750. Replace when edit capability is implemented

  constructor(@Inject(SUBSCRIPTION_MANAGER) private subscriptionManager: SubscriptionManager) { }

  ngOnInit(): void {
  }

  onShippingPointChange($event: ShippingPointLocationSelectOption): void {
    if (!$event) return;
    let l = $event.location;
    this.nameControl?.setValue(l.name ? l.name: 'N/A');
    this.countryControl?.setValue(l.country ? l.country: this.validateField ? undefined : 'N/A');
    this.cityControl?.setValue(l.city ? l.city: 'N/A');
    this.zipCodeControl?.setValue(l.zipCode ? l.zipCode: this.validateField ? undefined : 'N/A');
    this.stateControl?.setValue(l.state ? l.state: 'N/A');
    this.streetAddressControl?.setValue(l.address ? l.address: 'N/A');
    this.streetAddress2Control?.setValue(l.address2 ? l.address2: 'N/A');
    if (this.addressType === 'origin') {
      this.originShippingPointChangeEvent.emit($event.value);
    }
  }
}

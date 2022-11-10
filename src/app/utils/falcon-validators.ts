import {AbstractControl, ValidationErrors, Validators} from '@angular/forms';

export const ALPHA_NUMERIC_REGEX = /^\w*$/;

export const validateAlphanumeric = Validators.pattern(ALPHA_NUMERIC_REGEX);

export class CustomValidators {
    static requiredNonNA(control: AbstractControl): ValidationErrors | null {
        let isValueEmpty = control.value === undefined || control.value === null || control.value === '' || control.value === 'N/A';
        return isValueEmpty ? {'required': true} : null;
    }
}
import {Validators} from '@angular/forms';

export const ALPHA_NUMERIC_REGEX = /^\w*$/;

export const validateAlphanumeric = Validators.pattern(ALPHA_NUMERIC_REGEX);

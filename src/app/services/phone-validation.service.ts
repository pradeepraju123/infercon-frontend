import { Injectable } from '@angular/core';
import * as libphonenumber from 'libphonenumber-js';

@Injectable({
  providedIn: 'root'
})
export class PhoneValidationService {

  constructor() { }
  validatePhoneNumber(countryCode: libphonenumber.CountryCode, phoneNumber: string): boolean {
    try {
      const phoneNumberObj = libphonenumber.parsePhoneNumber(phoneNumber, countryCode);
      return phoneNumberObj.isValid();
    } catch (error) {
      console.error('Error validating phone number:', error);
      return false;
    }
  }
}

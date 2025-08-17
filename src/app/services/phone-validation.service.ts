import { Injectable } from '@angular/core';
import { CountryCode, parsePhoneNumber } from 'libphonenumber-js';

@Injectable({
  providedIn: 'root'
})
export class PhoneValidationService {
  constructor() { }

  validatePhoneNumber(countryCode: CountryCode, phoneNumber: string): boolean {
    try {
      if (!phoneNumber || !countryCode) return false;
      
      const phoneNumberObj = parsePhoneNumber(phoneNumber, countryCode);
      return phoneNumberObj?.isValid() || false;
    } catch (error) {
      console.error('Error validating phone number:', error);
      return false;
    }
  }
}
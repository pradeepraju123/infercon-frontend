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
  getMinPhoneLength(countryCode: string): number {
    const minLengths: {[key: string]: number} = {
      'IN': 10, // India
      'US': 10, // USA
      'GB': 10, // UK
      'CA': 10, // Canada
      'AU': 9,  // Australia
      'DE': 10, // Germany
      'FR': 9,  // France
      'IT': 10, // Italy
      'ES': 9,  // Spain
      'BR': 10, // Brazil
      'MX': 10, // Mexico
      'JP': 10, // Japan
      'CN': 11, // China
      'RU': 10, // Russia
      // Add more countries as needed
    };
    
    return minLengths[countryCode] || 8; // Default minimum
  }

}
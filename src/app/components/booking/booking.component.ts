import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { countries } from '../../model/country-data-store';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { PhoneValidationService } from '../../services/phone-validation.service';
import * as libphonenumber from 'libphonenumber-js';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css'
})
export class BookingComponent {
  public countries:any = countries
  bookingForm: FormGroup;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private _snackBar: MatSnackBar, private dialogRef: MatDialogRef<BookingComponent>,
    private bookServices: BookingService, // Update with the correct service
    private phoneValidation: PhoneValidationService
  ) {
    this.bookingForm = this.fb.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      country: ['', Validators.required],
      phone: ['', Validators.required],
      time: ['', Validators.required],
      date: ['', Validators.required],
      message: ['']
    });
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      const formData = this.bookingForm.value;
      const countryCode = this.getCodeFromDialCode(this.bookingForm.value.country);
      const combinedPhoneNumber = `${this.bookingForm.value.country}${this.bookingForm.value.phone}`;
      formData.phone = combinedPhoneNumber;
      if (countryCode) {
        const isValid = this.phoneValidation.validatePhoneNumber(countryCode, combinedPhoneNumber);
        if (isValid) {
          console.log('Phone number is valid.');
          this.bookServices.createBookings(formData).subscribe(
            (response) => {
              console.log('Booking successful:', response);
              this.successMessage = 'Booked successfully.';
              this.errorMessage = null;
              this.openSnackBar(this.successMessage)
              this.dialogRef.close();
              // You can handle success, e.g., show a success message
            },
            (error) => {
              console.error('Booking failed:', error);
              this.successMessage = null;
              this.errorMessage = `Error while booking : ${error.error.message}`;
              this.openSnackBar(this.errorMessage)
              this.dialogRef.close();
              // You can handle errors, e.g., show an error message
            });
      } else {
        console.log('Invalid phone number.');
        this.openSnackBar('Invalid phone number. Please enter a 10-digit phone number without including the country code.')
        // Additional logic for invalid phone number
      }
    }
    } else {
      // Handle form validation errors
      console.error('Form validation failed. Please check the form.');
  
      // You can also highlight the invalid fields or show an error message to the user
      Object.keys(this.bookingForm.controls).forEach(key => {
        const control = this.bookingForm.get(key);
        if (control instanceof FormControl) {
          control.markAsTouched();
        }
      });
    }
  }
  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', 
    {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
  getCodeFromDialCode(dialCode: string): libphonenumber.CountryCode | undefined {
    const country = this.countries.find((c: { dial_code: string; }) => c.dial_code === dialCode);
    console.log("country", country)
    return country?.code as libphonenumber.CountryCode;
  }
}

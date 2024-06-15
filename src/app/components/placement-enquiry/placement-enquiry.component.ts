import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { countries } from '../../model/country-data-store';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PhoneValidationService } from '../../services/phone-validation.service';
import * as libphonenumber from 'libphonenumber-js';
import { PlacementService } from '../../services/placement.service';
@Component({
  selector: 'app-placement-enquiry',
  templateUrl: './placement-enquiry.component.html',
  styleUrl: './placement-enquiry.component.css'
})
export class PlacementEnquiryComponent implements OnInit {
  public countries:any = countries
  bookingForm: FormGroup;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  successMessage: string | null = null;
  errorMessage: string | null = null;
  itemIdPass!: string;
  constructor(
    private fb: FormBuilder,
    private _snackBar: MatSnackBar, private dialogRef: MatDialogRef<PlacementEnquiryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {itemId: string},
    private placementService: PlacementService, // Update with the correct service
    private phoneValidation: PhoneValidationService
  ) {
    this.bookingForm = this.fb.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      job_id: [{ value: '', disabled: true }, Validators.required],
      student_code: ['', Validators.required],
      country: ['']
    });
  }
ngOnInit(): void {
 this.itemIdPass = this.data.itemId;
 this.bookingForm.patchValue({ job_id: this.itemIdPass });
 console.log(this.itemIdPass)
}
  onSubmit() {
    if (this.bookingForm.valid) {
      // const formData = this.bookingForm.value;
      const formData = this.bookingForm.getRawValue();
      const countryCode = this.getCodeFromDialCode(this.bookingForm.value.country);
      const combinedPhoneNumber = `${this.bookingForm.value.country}${this.bookingForm.value.phone}`;
      formData.phone = combinedPhoneNumber;
      if (countryCode) {
        const isValid = this.phoneValidation.validatePhoneNumber(countryCode, combinedPhoneNumber);
        if (isValid) {
          console.log('Phone number is valid.');
          this.placementService.createPlacementEnquiryList(formData).subscribe(
            (response) => {
              console.log('Placement Enquiry successful:', response);
              this.successMessage = 'Placement Enquiry successfully created.';
              this.errorMessage = null;
              this.openSnackBar(this.successMessage)
              this.dialogRef.close();
              // You can handle success, e.g., show a success message
            },
            (error) => {
              console.error('Placement Enquiry failed:', error);
              this.successMessage = null;
              this.errorMessage = `Error while Placement Enquiry : ${error.error.message}`;
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

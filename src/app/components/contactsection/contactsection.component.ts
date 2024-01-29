import { Component } from '@angular/core';
import { ContactService } from '../../services/contact.service';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition,} from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { countries } from '../../model/country-data-store';
import { MatDialogRef } from '@angular/material/dialog';
import { courses } from '../../model/course-data-store';

@Component({
  selector: 'app-contactsection',
  templateUrl: './contactsection.component.html',
  styleUrls: ['./contactsection.component.css']
})
export class ContactsectionComponent {
  public countries:any = countries
  public courses:any = courses
  contactForm: FormGroup;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  successMessage: string | null = null;
  errorMessage: string | null = null;
  constructor(  private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private contactServices: ContactService // Update with the correct service
  ) {
    this.contactForm = this.fb.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      country: ['', Validators.required],
      phone: ['', Validators.required],
      courses: ['', Validators.required],
      source : ['Website'], 
      message: ['']
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      const formData = this.contactForm.value;
      const combinedPhoneNumber = `${this.contactForm.value.country}${this.contactForm.value.phone}`;
      formData.phone = combinedPhoneNumber;
      console.log(formData)
      this.contactServices.createContact(formData).subscribe(
        (response) => {
          console.log('Contact successful:', response);
          this.successMessage = 'Contact successfully.';
          this.errorMessage = null;
          this.openSnackBar(this.successMessage)
          this.clearForm()
          // You can handle success, e.g., show a success message
        },
        (error) => {
          console.error('Contact submit failed:', error);
          this.successMessage = null;
          this.errorMessage = `Error while contact : ${error.error.message}`;
          this.openSnackBar(this.errorMessage)
          // You can handle errors, e.g., show an error message
        }
      );
    } else {
      // Handle form validation errors
      console.error('Form validation failed. Please check the form.');
    }
  }
  clearForm() {
  // Clear validators for each form control
  Object.keys(this.contactForm.controls).forEach(key => {
    const control = this.contactForm.get(key);

    // Check if control is not null before clearing validators
    if (control) {
      control.clearValidators();
      control.updateValueAndValidity();
    }
  });

  // Reset the form with default values
  this.contactForm.reset({
    source: 'Website'
    // You may need to set the default values for other form controls if needed
  });
  }
  openSnackBar(message: string, horizontalPosition: MatSnackBarHorizontalPosition = 'center', verticalPosition: MatSnackBarVerticalPosition = 'bottom',panelClass: string = 'success-snackbar') {
    this._snackBar.open(message, 'Close', {
      horizontalPosition: horizontalPosition,
      verticalPosition: verticalPosition,
      panelClass: panelClass
    });
  }
}

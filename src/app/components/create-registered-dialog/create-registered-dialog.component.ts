import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { countries } from '../../model/country-data-store';
import { courses } from '../../model/course-data-store';
import * as libphonenumber from 'libphonenumber-js';
import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-create-registered-dialog',
  templateUrl: './create-registered-dialog.component.html',
  styleUrls: ['./create-registered-dialog.component.css']
})
export class CreateRegisteredDialogComponent {
  registrationForm: FormGroup;
  public countries: any = countries;
  public courses: any = courses;
  document: File | null = null;
  isSubmitting = false; 

  constructor(
    public dialogRef: MatDialogRef<CreateRegisteredDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private snackBar: MatSnackBar
  ) {
    this.registrationForm = this.fb.group({
      modeOfEducation: ['', Validators.required],
      firstname: ['', Validators.required],
      middlename: [''],
      lastname: ['', Validators.required],
      bday: [''],
      country: ['', Validators.required],
      gender: [''],
      address: [''],
      email: ['', [Validators.required, Validators.email]],
      mobile: [''],
      additionalMobile: [''],
      workMobile: [''],
      company: [''],
      comments: [''],
      education: [''],
      industryexp: [''],
      yearsOfExp: [''],
      governmentId: [''],
      currencyType: [''],
      feesCurrency: [''],
      courses: [[], Validators.required]
    });

    // If data.user is provided, pre-fill the form
    if (data?.user) {
      this.prefillForm(data.user);
    }
  }

  private prefillForm(user: any): void {
    this.registrationForm.patchValue({
      firstname: user.fullname?.split(' ')[0] || '',
      lastname: user.fullname?.split(' ').slice(1).join(' ') || '',
      email: user.email || '',
      mobile: user.phone || '',
      courses: user.courses || [],
      comments: user.message || ''
    });
  }

  onSubmit(): void {
  if (this.registrationForm.valid && !this.isSubmitting) {
    this.isSubmitting = true; // ⬅️ disable button immediately
      console.log("🚀 isSubmitting set to true");

    const formData = this.registrationForm.value;

    // Prepare the data for registration
    const registrationData = {
      modeOfEducation: formData.modeOfEducation,
      courses: formData.courses,
      firstname: formData.firstname,
      middlename: formData.middlename,
      lastname: formData.lastname,
      bday: formData.bday,
      gender: formData.gender,
      address: formData.address,
      email: formData.email,
      mobile: formData.mobile ? `${formData.country}${formData.mobile}` : '',
      additionalMobile: formData.additionalMobile ? `${formData.country}${formData.additionalMobile}` : '',
      workMobile: formData.workMobile ? `${formData.country}${formData.workMobile}` : '',
      company: formData.company,
      comments: formData.comments || '',
      education: formData.education,
      industryexp: formData.industryexp,
      yearsOfExp: formData.yearsOfExp,
      governmentId: formData.governmentId,
      currencyType: formData.currencyType,
      feesCurrency: formData.feesCurrency,
      document: this.document ? this.document.name : null
    };

    // ✅ Validate phone number if provided
    if (formData.mobile) {
      const countryCode = this.getCodeFromDialCode(formData.country);
      if (countryCode) {
        const fullNumber = `${formData.country}${formData.mobile}`;
        const isValid = this.validatePhoneNumber(countryCode, fullNumber);
        if (!isValid) {
          this.snackBar.open(
            'Invalid phone number. Please enter a valid phone number.',
            'Close',
            { duration: 5000 }
          );
          this.isSubmitting = false; // re-enable button
          return;
        }
      }
    }

    this.registrationService.createRegistration(registrationData).subscribe(
      (response) => {
        this.snackBar.open('Registration created successfully!', 'Close', {
          duration: 3000
        });
        this.dialogRef.close({
          success: true,
          email: formData.email
        });
          this.isSubmitting = false;
      },
      (error) => {
        console.error('Error:', error);
        this.snackBar.open(
          'Error creating registration: ' +
            (error.error?.message || error.message),
          'Close',
          { duration: 5000 }
        );
        this.isSubmitting = false; // re-enable if failed
      }
    );
  } else {
    this.snackBar.open('Please fill all required fields correctly', 'Close', {
      duration: 3000
    });
  }
}


  fileEvent(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.document = file;
    }
  }

  private validatePhoneNumber(countryCode: libphonenumber.CountryCode, phoneNumber: string): boolean {
    try {
      const parsedNumber = libphonenumber.parsePhoneNumberFromString(phoneNumber, countryCode);
      return parsedNumber ? parsedNumber.isValid() : false;
    } catch (e) {
      return false;
    }
  }

  private getCodeFromDialCode(dialCode: string): libphonenumber.CountryCode | undefined {
    const country = this.countries.find((c: any) => c.dial_code === dialCode);
    return country?.code as libphonenumber.CountryCode;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
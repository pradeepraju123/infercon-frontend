import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactService } from '../../services/contact.service';
import { countries } from '../../model/country-data-store';
import { PhoneValidationService } from '../../services/phone-validation.service';
import { CountryCode } from 'libphonenumber-js';
@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {
  createForm: FormGroup;
  public countries: any = countries;
  public sources = ['Facebook', 'Linkedin', 'Website', 'Direct Enquiry', 'Reference'];
  horizontalPosition: 'right' = 'right';
  verticalPosition: 'top' = 'top';

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private _snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CreateUserComponent>,
    private phonevalidationService:PhoneValidationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.createForm = this.fb.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required], [this.validatePhoneNumber.bind(this)]],
      city: [''],
      state: [''], 
      country: ['',Validators.required],
      courses: this.fb.array([]),
      message: [''],
      source: [''],
      location: this.fb.array([]),
      languages: this.fb.array([])
    });
  }

  ngOnInit(): void {
  this.createForm.get('country')?.valueChanges.subscribe(() => {
    this.createForm.get('phone')?.updateValueAndValidity();
  });
}
validatePhoneNumber(control: any) {
  return new Promise((resolve) => {
    const countryControl = this.createForm?.get('country');
    const phoneNumber = control.value;
    
    if (!phoneNumber || !countryControl?.value) {
      resolve(null); // Let required validator handle empty fields
      return;
    }

    const selectedCountry = this.countries.find((c: any) => c.name === countryControl.value);
    
    if (!selectedCountry) {
      resolve({ invalidCountry: true });
      return;
    }

    try {
      const isValid = this.phonevalidationService.validatePhoneNumber(
        selectedCountry.code as CountryCode,
        phoneNumber
      );
      resolve(isValid ? null : { invalidPhone: true });
    } catch (error:any) {
      // Handle specific validation errors
      if (error.message.includes('TOO_SHORT')) {
        resolve({ phoneTooShort: true });
      } else {
        resolve({ invalidPhone: true });
      }
    }
  });
}
onSubmit() {
  if (this.createForm.valid) {
    console.log('Form data being sent:', this.createForm.value);
    this.contactService.createUser(this.createForm.value).subscribe(
      (response) => {
        // Success - show the created user data
        console.log('User created successfully:', response.data);
        
        // Show success message with user details
        const user = response.data;
        const successMessage = `
          User Created Successfully!
          Name: ${user.fullname}
          Email: ${user.email}
          Phone: ${user.phone}
          ID: ${user._id}
        `;
        
        this._snackBar.open(successMessage, 'Close', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 5000, // Show for 5 seconds
          panelClass: ['success-snackbar']
        });
        
        // Close the dialog and pass the created user data back to parent component
        this.dialogRef.close(user);
      },
      error => {
        let errorMessage = 'Failed to create user!';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
          
          // Specific handling for phone number exists error
          if (error.status === 409) {
            // Highlight the phone field
            this.createForm.get('phone')?.setErrors({ phoneExists: true });
            // Show error under the phone field
            errorMessage = "User with this phone number already exists!";
          }
        }
        
        this._snackBar.open(errorMessage, 'Close', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
        });
      }
    );
  }
}

  // Form array methods (similar to edit-contact)
  get coursesControls() {
    return (this.createForm.get('courses') as FormArray).controls;
  }

  addCourse() {
    const courses = this.createForm.get('courses') as FormArray;
    courses.push(this.fb.control(''));
  }

  removeCourse(index: number) {
    const courses = this.createForm.get('courses') as FormArray;
    courses.removeAt(index);
  }

get languagesControls(){
  return (this.createForm.get('languages') as FormArray).controls;
}
addLanguage(){
  const language=this.createForm.get('languages') as FormArray;
  language.push(this.fb.control(''));
}
removeLanguage(index:number){
  const language=this.createForm.get('languages') as FormArray;
  language.removeAt(index);
}

get locationControls() {
  return (this.createForm.get('location') as FormArray).controls;
}

addLocation(){
  
  const location = this.createForm.get('location') as FormArray;
  location.push(this.fb.control(''))
}
removeLocation(index:number){
  const location=this.createForm.get('location') as FormArray;
  location.removeAt(index)
}
get commentsControls(){
  return (this.createForm.get('comments') as FormArray).controls;
}

addComment(){
  const comments=this.createForm.get('comments') as FormArray;
  comments.push(this.fb.control(''))
}

removeComment(index:number){
  const comments=this.createForm.get('comments') as FormArray;
  comments.removeAt(index)
}
}

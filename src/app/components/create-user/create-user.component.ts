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

    // Find the country code from your countries data
    const selectedCountry = this.countries.find((c: any) => c.name === countryControl.value);
    
    if (!selectedCountry) {
      resolve({ invalidCountry: true });
      return;
    }

    const isValid = this.phonevalidationService.validatePhoneNumber(
      selectedCountry.code as CountryCode,
      phoneNumber
    );

    resolve(isValid ? null : { invalidPhone: true });
  });
}

  onSubmit() {
    if (this.createForm.valid) {
      this.contactService.createContact(this.createForm.value).subscribe(
        () => {
          this._snackBar.open('User created successfully!', 'Close', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
          });
          this.dialogRef.close(true);
        },
        error => {
          this._snackBar.open('Failed to create user!', 'Close', {
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
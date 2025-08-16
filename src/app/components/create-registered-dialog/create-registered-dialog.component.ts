// create-registered-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-registered-dialog',
  templateUrl: './create-registered-dialog.component.html',
  styleUrls: ['./create-registered-dialog.component.css']
})
export class CreateRegisteredDialogComponent {
  registrationForm: FormGroup;
  courses: string[] = ['CAE', 'CFA', 'FRM', 'CMA', 'ACCA']; // Add your actual courses here
  countries: string[] = ['India', 'USA', 'UK', 'Canada', 'Australia']; // Add more countries as needed
  

  constructor(
    public dialogRef: MatDialogRef<CreateRegisteredDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private contactService: ContactService,
    private snackBar: MatSnackBar
  ) {
    this.registrationForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      country: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      course: ['', Validators.required],
      comments: ['']
    });
  }

  onSubmit(): void {
  if (this.registrationForm.valid) {
    // Map the form data to match the backend schema
    const contactData = {
      fullname: this.registrationForm.value.name,
      email: this.registrationForm.value.email,
      country: this.registrationForm.value.country,
      phone: this.registrationForm.value.phone,
      courses: [this.registrationForm.value.course], // Note: backend expects an array
      message: this.registrationForm.value.comments || '',
      additional_details: this.registrationForm.value.comments || '',
      lead_status: 'New lead' // Set default lead status
    };
    console.log('Sending contact data:', contactData);

    this.contactService.createRegisteredContact(contactData).subscribe(
      (response) => {
        this.snackBar.open('Contact registered successfully!', 'Close', {
          duration: 3000
        });
        this.dialogRef.close(true);
      },
      (error) => {
        console.error('Error:', error);
        this.snackBar.open('Error registering contact: ' + (error.error?.message || error.message), 'Close', {
          duration: 5000
        });
      }
    );
  }
}
  onCancel(): void {
    this.dialogRef.close();
  }
}
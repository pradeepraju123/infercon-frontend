import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { countries } from '../../model/country-data-store';
import { courses } from '../../model/course-data-store';
import * as libphonenumber from 'libphonenumber-js';
import { AccountsService } from '../../services/accounts.service';

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
  installmentType: 'auto' | 'manual' = 'auto';
   maxInstallments = 12;
currentInstallmentId: string | null = null;
  constructor(
    public dialogRef: MatDialogRef<CreateRegisteredDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private accountService: AccountsService,
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
      
      // Auto installment fields
      totalAmount: ['', [Validators.min(0)]],
      numberOfInstallments: ['', [Validators.min(1)]],
      
      // Manual installment fields
      installmentType: ['auto'],
      manualInstallments: this.fb.array([]),
      
      courses: [[], Validators.required]
    });

    // Initialize with 6 manual installments
    this.addManualInstallment();

    // If data.user is provided, pre-fill the form
    if (data?.user) {
      this.prefillForm(data.user);
    }

    // Watch for installment type changes
    this.registrationForm.get('installmentType')?.valueChanges.subscribe(value => {
      this.installmentType = value;
      this.updateValidators();
    });

    this.updateValidators();
  }

  get manualInstallments(): FormArray {
    return this.registrationForm.get('manualInstallments') as FormArray;
  }

  // Helper method to get form control safely
  getInstallmentControl(index: number, controlName: string): FormControl {
    const installment = this.manualInstallments.at(index);
    return installment.get(controlName) as FormControl;
  }

  private initializeManualInstallments(): void {
    for (let i = 0; i < 6; i++) {
      this.addManualInstallment();
    }
  }

 addManualInstallment(): void {
    if (this.manualInstallments.length < this.maxInstallments) {
      const installmentGroup = this.fb.group({
        amount: [0, [Validators.required, Validators.min(0)]],
        dueDate: ['', Validators.required],
        status: ['pending'],
        paidAmount: [0],
        notes: ['']
      });
      this.manualInstallments.push(installmentGroup);
    } else {
      this.snackBar.open(`Maximum ${this.maxInstallments} installments allowed`, 'Close', {
        duration: 3000
      });
    }
  }
  removeManualInstallment(index: number): void {
    this.manualInstallments.removeAt(index);
  }
  private updateValidators(): void {
    const totalAmountControl = this.registrationForm.get('totalAmount');
    const numberOfInstallmentsControl = this.registrationForm.get('numberOfInstallments');

    if (this.installmentType === 'auto') {
      totalAmountControl?.setValidators([Validators.required, Validators.min(0)]);
      numberOfInstallmentsControl?.setValidators([Validators.required, Validators.min(1)]);
    } else {
      totalAmountControl?.clearValidators();
      numberOfInstallmentsControl?.clearValidators();
    }

    totalAmountControl?.updateValueAndValidity();
    numberOfInstallmentsControl?.updateValueAndValidity();
  }

  calculateManualTotal(): number {
    return this.manualInstallments.controls.reduce((total, control) => {
      return total + (control.get('amount')?.value || 0);
    }, 0);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'paid': return '#4caf50'; // Green
      case 'overdue': return '#f44336'; // Red
      case 'partially_paid': return '#ff9800'; // Orange
      default: return '#ffc107'; // Yellow for pending
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'paid': return 'Paid';
      case 'overdue': return 'Overdue';
      case 'partially_paid': return 'Partial';
      default: return 'Pending';
    }
  }

 updateInstallmentStatus(index: number, status: string): void {
  const installmentId = this.currentInstallmentId; // the MongoDB _id of the installment plan

  this.accountService.updateInstallmentStatus({
    installmentId: installmentId,
    installmentIndex: index,
    status: status,
    paymentDate: new Date()
  }).subscribe({
    next: (res) => {
      console.log('Updated in DB:', res);
      // also update UI immediately
      this.manualInstallments.at(index).patchValue({ status: status });
    },
    error: (err) => {
      console.error('Error updating DB:', err);
    }
  });
}


  onAmountChange(index: number): void {
    const installment = this.manualInstallments.at(index);
    const amount = installment.get('amount')?.value;
    const paidAmount = installment.get('paidAmount')?.value;
    const status = installment.get('status')?.value;

    if (status === 'paid' && paidAmount !== amount) {
      installment.patchValue({ paidAmount: amount });
    }
  }

  getInstallmentStatus(index: number): string {
     const installment = this.manualInstallments.at(index);
  return installment?.get('status')?.value || 'pending';
  }

  getInstallmentPaidAmount(index: number): number {
    return this.manualInstallments.at(index).get('paidAmount')?.value || 0;
  }

  isInstallmentDisabled(index: number, status: string): boolean {
    return this.getInstallmentStatus(index) === status;
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
      this.isSubmitting = true;

      const formData = this.registrationForm.value;

      // Common data for both installment types
      const commonData = {
        contactId: this.data?.user?._id,
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

      // Validate phone number if provided
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
            this.isSubmitting = false;
            return;
          }
        }
      }

      if (this.installmentType === 'auto') {
        // Auto installment plan
        const installmentData = {
          ...commonData,
          totalAmount: formData.totalAmount,
          numberOfInstallments: formData.numberOfInstallments,
          startDate: new Date()
        };

        this.accountService.setupInstallmentPlan(installmentData).subscribe(
          (response) => {
            this.handleSuccess();
          },
          (error) => {
            this.handleError(error);
          }
        );
      } else {
        // Manual installment plan
        const manualInstallmentData = {
          ...commonData,
          totalAmount: this.calculateManualTotal(),
          installments: formData.manualInstallments.map((inst: any) => ({
            amount: inst.amount,
            dueDate: inst.dueDate,
            status: inst.status,
            paidAmount: inst.paidAmount,
            notes: inst.notes
          }))
        };

        this.accountService.setupManualInstallmentPlan(manualInstallmentData).subscribe(
          (response) => {
            this.handleSuccess();
          },
          (error) => {
            this.handleError(error);
          }
        );
      }
    } else {
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000
      });
    }
  }

  private handleSuccess(): void {
    this.snackBar.open('Registration with installment plan created successfully!', 'Close', {
      duration: 3000
    });
    this.dialogRef.close({
      success: true,
      email: this.registrationForm.value.email
    });
    this.isSubmitting = false;
  }

  private handleError(error: any): void {
    console.error('Error:', error);
    this.snackBar.open(
      'Error creating registration: ' + (error.error?.message || error.message),
      'Close',
      { duration: 5000 }
    );
    this.isSubmitting = false;
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
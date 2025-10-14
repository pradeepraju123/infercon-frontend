import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
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
  maxInstallments = 6;
  currentInstallmentId: string | null = null;
  currentInstallmentPlanId: string | null = null;

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

    // Don't pre-add installments for auto mode
    if (this.installmentType === 'manual') {
      this.addManualInstallment();
    }

    // If data.user is provided, pre-fill the form
    if (data?.user) {
      this.prefillForm(data.user);
    }

    // Watch for installment type changes
    this.registrationForm.get('installmentType')?.valueChanges.subscribe(value => {
      this.installmentType = value;
      this.updateValidators();
      
      // Clear or add installments based on type
      if (value === 'auto') {
        this.clearManualInstallments();
      } else {
        if (this.manualInstallments.length === 0) {
          this.addManualInstallment();
        }
      }
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

  // Add this method to clear manual installments
  private clearManualInstallments(): void {
    while (this.manualInstallments.length !== 0) {
      this.manualInstallments.removeAt(0);
    }
  }

  addManualInstallment(): void {
    if (this.manualInstallments.length < this.maxInstallments) {
      const installmentGroup = this.fb.group({
        amount: [0, [Validators.required, Validators.min(1)]],
        dueDate: ['', Validators.required],
        status: ['pending'],
        paidAmount: [0],
        paymentDate: [null],
        notes: ['']
      });
      this.manualInstallments.push(installmentGroup);
      
      // Trigger validation update
      this.updateValidators();
    } else {
      this.snackBar.open(`Maximum ${this.maxInstallments} installments allowed`, 'Close', {
        duration: 3000
      });
    }
  }

  removeManualInstallment(index: number): void {
    this.manualInstallments.removeAt(index);
    this.updateValidators();
  }

  // Update the validator method to be more robust
  private updateValidators(): void {
    const totalAmountControl = this.registrationForm.get('totalAmount');
    const numberOfInstallmentsControl = this.registrationForm.get('numberOfInstallments');
    const manualInstallmentsControl = this.registrationForm.get('manualInstallments');

    if (this.installmentType === 'auto') {
      // Set required validators for auto mode
      totalAmountControl?.setValidators([Validators.required, Validators.min(1)]);
      numberOfInstallmentsControl?.setValidators([Validators.required, Validators.min(1), Validators.max(12)]);
      
      // Clear validators for manual installments in auto mode
      manualInstallmentsControl?.clearValidators();
      
    } else {
      // Manual mode
      totalAmountControl?.clearValidators();
      numberOfInstallmentsControl?.clearValidators();
      
      // Set validators for manual installments
      manualInstallmentsControl?.setValidators(this.validateManualInstallments.bind(this));
    }

    totalAmountControl?.updateValueAndValidity();
    numberOfInstallmentsControl?.updateValueAndValidity();
    manualInstallmentsControl?.updateValueAndValidity();
  }

  // Add validation for manual installments
  private validateManualInstallments(control: AbstractControl): ValidationErrors | null {
    const installments = control as FormArray;
    
    if (installments.length === 0) {
      return { 'noInstallments': true };
    }

    const totalAmount = installments.controls.reduce((sum, installment) => {
      return sum + (installment.get('amount')?.value || 0);
    }, 0);

    if (totalAmount <= 0) {
      return { 'invalidTotalAmount': true };
    }

    // Check if any installment has invalid data
    for (let i = 0; i < installments.length; i++) {
      const installment = installments.at(i);
      const amount = installment.get('amount')?.value;
      const dueDate = installment.get('dueDate')?.value;

      if (!amount || amount <= 0) {
        return { 'invalidInstallmentAmount': true };
      }

      if (!dueDate) {
        return { 'missingDueDate': true };
      }
    }

    return null;
  }

  // Add a method to check if form is valid for submission
  isFormValid(): boolean {
    if (!this.registrationForm.valid) {
      return false;
    }

    if (this.installmentType === 'auto') {
      const totalAmount = this.registrationForm.get('totalAmount')?.value;
      const numberOfInstallments = this.registrationForm.get('numberOfInstallments')?.value;
      
      return totalAmount > 0 && numberOfInstallments > 0;
    } else {
      return this.manualInstallments.length > 0 && this.calculateManualTotal() > 0;
    }
  }

  // Update your onSubmit method to use the new validation
  onSubmit(): void {
    if (this.isFormValid() && !this.isSubmitting) {
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
            this.currentInstallmentPlanId = response.data.installment._id;
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
            this.currentInstallmentPlanId = response.data.installment._id;
            this.handleSuccess();
          },
          (error) => {
            this.handleError(error);
          }
        );
      }
    } else {
      console.log('Form invalid reasons:', {
        formValid: this.registrationForm.valid,
        installmentType: this.installmentType,
        totalAmount: this.registrationForm.get('totalAmount')?.value,
        numberOfInstallments: this.registrationForm.get('numberOfInstallments')?.value,
        manualTotal: this.calculateManualTotal(),
        manualInstallmentsCount: this.manualInstallments.length
      });
      
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000
      });
    }
  }

  // ... rest of your existing methods (calculateManualTotal, getStatusColor, etc.) ...

  calculateManualTotal(): number {
    return this.manualInstallments.controls.reduce((total, control) => {
      return total + (control.get('amount')?.value || 0);
    }, 0);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'paid': return '#4caf50';
      case 'overdue': return '#f44336';
      case 'partially_paid': return '#ff9800';
      default: return '#ffc107';
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
    if (!this.currentInstallmentPlanId) {
      this.snackBar.open('Please save the registration first before updating installment status', 'Close', {
        duration: 3000
      });
      return;
    }

    const installmentControl = this.manualInstallments.at(index);
    const amount = installmentControl.get('amount')?.value;
    
    this.accountService.updateInstallmentStatus({
      installmentId: this.currentInstallmentPlanId,
      installmentIndex: index,
      status: status,
      paymentDate: status === 'paid' ? new Date() : null,
      amount: amount,
      notes: `Marked as ${status}`
    }).subscribe({
      next: (res) => {
        console.log('Updated in DB:', res);
        
        const installmentControl = this.manualInstallments.at(index);
        installmentControl.patchValue({ 
          status: status,
          paidAmount: status === 'paid' ? amount : 0
        });
        
        this.snackBar.open(`Installment ${index + 1} marked as ${status}`, 'Close', {
          duration: 2000
        });
      },
      error: (err) => {
        console.error('Error updating DB:', err);
        this.snackBar.open('Error updating installment status', 'Close', {
          duration: 3000
        });
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
    const status = installment?.get('status')?.value || 'pending';
    const amount = installment?.get('amount')?.value || 0;
    const paidAmount = installment?.get('paidAmount')?.value || 0;
    
    if (status === 'paid' && paidAmount !== amount) {
      installment.patchValue({ paidAmount: amount });
    }
    
    return status;
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
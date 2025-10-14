
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AccountsService } from '../../services/accounts.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-installment-management-dialog',
  templateUrl: './installment-management-dialog.component.html',
  styleUrls: ['./installment-management-dialog.component.css']
})
export class InstallmentManagementDialogComponent implements OnInit {
  installmentForm: FormGroup;
  isSubmitting = false;
  today = new Date();
  showPaymentPrompt = false;
  currentInstallmentIndex: number | null = null;
  paymentAmount: number = 0;
  paymentType: 'full' | 'partial' = 'partial';
  remainingAmount: number = 0;
  installmentAmount: number = 0;

  constructor(
    public dialogRef: MatDialogRef<InstallmentManagementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private accountService: AccountsService,
    private snackBar: MatSnackBar
  ) {
    this.installmentForm = this.fb.group({
      installments: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadInstallments();
  }

  get installments(): FormArray {
    return this.installmentForm.get('installments') as FormArray;
  }

  loadInstallments(): void {
    if (this.data.account.installments) {
      this.createInstallmentForms(this.data.account.installments);
    } else {
      this.accountService.getInstallmentDetails(this.data.account.contactRef).subscribe(
        (response: any) => {
          if (response.data && response.data.installments) {
            this.createInstallmentForms(response.data.installments);
          }
        },
        error => {
          console.error('Error loading installments:', error);
          this.snackBar.open('Error loading installments', 'Close', { duration: 3000 });
        }
      );
    }
  }

  createInstallmentForms(installments: any[]): void {
  this.installments.clear();
  
  
  installments.forEach((installment, index) => {
    console.log(`Creating form for installment ${index}:`, installment);
    console.log(`Payment dates for installment ${index}:`, installment.paymentDates);
    this.addInstallmentForm(installment, index);
  });
  
}

  addInstallmentForm(installmentData?: any, index?: number): void {
    const defaultData = {
      _id: null,
      amount: 0,
      dueDate: new Date(),
      status: 'pending',
      paidAmount: 0,
      dueAmount: 0,
      notes: '',
      isOverdue: false,
      paymentDates:[]
    };

    const data = installmentData || defaultData;
     if (!data.paymentDates || !Array.isArray(data.paymentDates)) {
    data.paymentDates = [];
  } else {
    // Ensure each payment date object has the correct structure
    data.paymentDates = data.paymentDates.map((payment: any) => ({
      date: payment.date ? new Date(payment.date) : new Date(),
      amount: payment.amount || 0,
      paymentMethod: payment.paymentMethod || 'cash',
      reference: payment.reference || `PAY_${Date.now()}`,
      notes: payment.notes || '',
      _id: payment._id // Preserve existing IDs if they exist
    }));
  }
    
    if (!installmentData) {
      const lastInstallment = this.installments.at(this.installments.length - 1);
      if (lastInstallment) {
        const lastDueDate = new Date(lastInstallment.get('dueDate')?.value);
        lastDueDate.setDate(lastDueDate.getDate() + 30);
        data.dueDate = lastDueDate;
      } else {
        data.dueDate = new Date();
      }
    }

    const dueDate = new Date(data.dueDate);
    const isOverdue = dueDate < this.today && data.status !== 'paid';
    const remainingAmount = data.amount - (data.paidAmount || 0);
    const dueAmount = isOverdue ? remainingAmount : 0;

    const installmentGroup = this.fb.group({
      _id: [data._id],
      amount: [data.amount, [Validators.required, Validators.min(0)]],
      dueDate: [dueDate, Validators.required],
      status: [data.status],
      paidAmount: [data.paidAmount || 0, [Validators.min(0)]],
      dueAmount: [dueAmount, [Validators.min(0)]],
      notes: [data.notes || ''],
      isOverdue: [isOverdue],
      paymentDates: [data.paymentDates]
    });

    // Add custom validator for paid amount
    installmentGroup.get('paidAmount')?.setValidators([
      Validators.min(0),
      Validators.max(installmentGroup.get('amount')?.value)
    ]);

    if (index !== undefined) {
      this.installments.insert(index, installmentGroup);
    } else {
      this.installments.push(installmentGroup);
    }
  }

  addNewInstallment(): void {
    this.addInstallmentForm();
    this.snackBar.open('New installment added', 'Close', { duration: 2000 });
  }

  removeInstallment(index: number): void {
    if (this.installments.length > 1) {
      this.installments.removeAt(index);
      this.snackBar.open('Installment removed', 'Close', { duration: 2000 });
    } else {
      this.snackBar.open('Cannot remove the only installment', 'Close', { duration: 3000 });
    }
  }

  onDueDateChange(index: number): void {
    const installment = this.installments.at(index);
    const dueDate = new Date(installment.get('dueDate')?.value);
    const today = new Date();
    
    // Check if installment is overdue
    const isOverdue = dueDate < today && installment.get('status')?.value !== 'paid';
    installment.get('isOverdue')?.setValue(isOverdue);
    
    if (isOverdue) {
      const amount = installment.get('amount')?.value;
      const paidAmount = installment.get('paidAmount')?.value || 0;
      const remainingAmount = amount - paidAmount;
      installment.get('dueAmount')?.setValue(remainingAmount);
    } else {
      installment.get('dueAmount')?.setValue(0);
    }
    
    this.updateInstallmentStatus(index);
  }

  onAmountChange(index: number): void {
    const installment = this.installments.at(index);
    const amount = installment.get('amount')?.value;
    const paidAmount = installment.get('paidAmount')?.value || 0;
    
    // Update paid amount validator
    installment.get('paidAmount')?.setValidators([
      Validators.min(0),
      Validators.max(amount)
    ]);
    installment.get('paidAmount')?.updateValueAndValidity();
    
    // Update due amount if overdue
    if (installment.get('isOverdue')?.value) {
      const remainingAmount = amount - paidAmount;
      installment.get('dueAmount')?.setValue(Math.max(0, remainingAmount));
    }
    
    this.updateInstallmentStatus(index);
  }

  onPaidAmountChange(index: number): void {
    const installment = this.installments.at(index);
    const paidAmount = installment.get('paidAmount')?.value || 0;
    const amount = installment.get('amount')?.value;
    
    // Update due amount if overdue
    if (installment.get('isOverdue')?.value) {
      const remainingAmount = amount - paidAmount;
      installment.get('dueAmount')?.setValue(Math.max(0, remainingAmount));
    }
    
    this.updateInstallmentStatus(index);
  }

  onDueAmountChange(index: number): void {
    const installment = this.installments.at(index);
    const dueAmount = installment.get('dueAmount')?.value || 0;
    const amount = installment.get('amount')?.value;
    
    if (dueAmount > 0) {
      const paidAmount = amount - dueAmount;
      installment.get('paidAmount')?.setValue(paidAmount);
      this.updateInstallmentStatus(index);
    }
  }

  updateInstallmentStatus(index: number): void {
    
    const installment = this.installments.at(index);
    const paidAmount = installment.get('paidAmount')?.value || 0;
    const amount = installment.get('amount')?.value;
    const dueDate = new Date(installment.get('dueDate')?.value);
    const today = new Date();
    
    let status = 'pending';
    
    if (paidAmount >= amount) {
      status = 'paid';
      installment.get('dueAmount')?.setValue(0);
      installment.get('isOverdue')?.setValue(false);
    } else if (paidAmount > 0) {
      status = 'partially_paid';
    } else if (dueDate < today) {
      status = 'overdue';
      installment.get('isOverdue')?.setValue(true);
    }
    
    installment.get('status')?.setValue(status);
    
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

  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < this.today;
  }

  calculateTotal(controlName: string): number {
    return this.installments.controls.reduce((total, control) => {
      return total + (control.get(controlName)?.value || 0);
    }, 0);
  }

onSubmit(): void {
  if (this.installmentForm.valid && !this.isSubmitting) {
    this.isSubmitting = true;

    const manualInstallmentData = {
      contactId: this.data.account.contactRef,
      totalAmount: this.calculateTotal('amount'),
      installments: this.installments.value.map((installment: any, index: number) => {
        // CRITICAL: Preserve ALL payment dates and ensure proper structure
        const paymentDates = (installment.paymentDates || []).map((payment: any) => ({
          date: payment.date ? new Date(payment.date).toISOString() : new Date().toISOString(),
          amount: payment.amount || 0,
          paymentMethod: payment.paymentMethod || 'cash',
          reference: payment.reference || `PAY_${Date.now()}_${index}`,
          notes: payment.notes || '',
          _id: payment._id // Preserve existing IDs
        }));

        const installmentData: any = {
          amount: installment.amount,
          dueDate: installment.dueDate.toISOString(),
          status: installment.status,
          paidAmount: installment.paidAmount || 0,
          paymentDates: paymentDates, // Include ALL payment dates
          notes: installment.notes || '',
        };

        // If there's paid amount but no payment dates, create one
        if (installment.paidAmount > 0 && paymentDates.length === 0) {
          installmentData.paymentDates = [{
            date: new Date().toISOString(),
            amount: installment.paidAmount,
            paymentMethod: 'manual',
            reference: `SETUP_${Date.now()}_${index}`,
            notes: installment.notes || 'Initial payment'
          }];
        }

        return installmentData;
      })
    };

    console.log('Submitting installment data with ALL payment dates:', 
      manualInstallmentData.installments.map((inst: any) => ({
        amount: inst.amount,
        paidAmount: inst.paidAmount,
        paymentDatesCount: inst.paymentDates.length,
        paymentDates: inst.paymentDates
      }))
    );
    
    this.accountService.setupManualInstallmentPlan(manualInstallmentData).subscribe(
      (response: any) => {
        console.log('Setup response with ALL payment dates:', 
          response.data.installment.installments.map((inst: any) => ({
            paymentDatesCount: inst.paymentDates.length,
            paymentDates: inst.paymentDates
          }))
        );
        this.snackBar.open('Installment plan updated successfully!', 'Close', {
          duration: 3000
        });
        this.dialogRef.close({ success: true });
        this.isSubmitting = false;
      },
      error => {
        console.error('Error updating installment plan:', error);
        this.snackBar.open('Error updating installment plan', 'Close', {
          duration: 3000
        });
        this.isSubmitting = false;
      }
    );
  }
}

  onCancel(): void {
    this.dialogRef.close();
  }

 
processPayment(index: number, paymentType: 'full' | 'partial' = 'partial', customAmount?: number): void {
  const installment = this.installments.at(index);
  const amount = installment.get('amount')?.value;
  const currentPaidAmount = installment.get('paidAmount')?.value || 0;
  const remainingAmount = amount - currentPaidAmount;
  
  // CRITICAL: Get current payment dates and ensure it's an array
  let currentPaymentDates = installment.get('paymentDates')?.value || [];
  if (!Array.isArray(currentPaymentDates)) {
    currentPaymentDates = [];
  }
  
  let paidAmount: number;

  if (paymentType === 'full') {
    paidAmount = remainingAmount;
  } else if (customAmount !== undefined) {
    paidAmount = customAmount;
  } else {
    paidAmount = remainingAmount; 
  }

  if (isNaN(paidAmount) || paidAmount <= 0) {
    this.snackBar.open('Invalid payment amount', 'Close', { duration: 3000 });
    return;
  }

  if (paidAmount > remainingAmount) {
    this.snackBar.open(`Payment cannot exceed remaining amount: ${remainingAmount}`, 'Close', { duration: 3000 });
    return;
  }

  const newPayment = {
    date: new Date(),
    amount: paidAmount,
    paymentMethod: 'cash',
    reference: `PAY_${new Date().getTime()}`,
    notes: installment.get('notes')?.value || ''
  };

  // Update payment dates array
  const updatedPaymentDates = [...currentPaymentDates, newPayment];
  installment.get('paymentDates')?.setValue(updatedPaymentDates);
  
  console.log('Updated payment dates after new payment:', updatedPaymentDates);
  
  const newTotalPaid = currentPaidAmount + paidAmount;
  installment.get('paidAmount')?.setValue(newTotalPaid);
  
  this.updateInstallmentStatus(index);

  // Set submitting state
  this.isSubmitting = true;

  const paymentData = {
    installmentId: this.data.account._id,
    paidAmount: paidAmount,
    installmentIndex: index,
    paymentMethod: 'cash',
    reference: `PAY_${new Date().getTime()}`,
    notes: installment.get('notes')?.value || ''
  };

  console.log('Sending payment data:', paymentData);
  console.log('Updated paymentDates:', updatedPaymentDates);

  this.accountService.payManualInstallment(paymentData).subscribe(
    (response: any) => {
      this.snackBar.open(`Payment of ${paidAmount} processed successfully!`, 'Close', { duration: 3000 });
      this.isSubmitting = false;
    
      // Refresh data to get updated paymentDates from backend
      this.refreshInstallmentData();
    },
    (error) => {
      console.error('Payment error:', error);
      this.snackBar.open('Payment failed: ' + (error.error?.message || 'Server error'), 'Close', { duration: 5000 });
      this.isSubmitting = false;
      
      // Revert the payment dates on error
      installment.get('paidAmount')?.setValue(currentPaidAmount);
      installment.get('paymentDates')?.setValue(currentPaymentDates);
      this.updateInstallmentStatus(index);
    }
  );
}
refreshInstallmentData(): void {
  this.accountService.getInstallmentDetails(this.data.account.contactRef).subscribe(
    (response: any) => {
      if (response.data) {
        let installmentData = response.data.installment || response.data;
        
        
        console.log(' installmentData from refresh:', installmentData);
        
        
        if (installmentData.installments) {
          installmentData.installments.forEach((inst: any, index: number) => {
            console.log(`Refresh - Installment ${index} paymentDates:`, inst.paymentDates);
          });
          
          
          installmentData.installments = installmentData.installments.map((inst: any) => ({
            ...inst,
            paymentDates: inst.paymentDates || []
          }));
        }
        
        this.createInstallmentForms(installmentData.installments);
        this.data.account = installmentData;
        
        console.log('Refreshed data (simplified):', installmentData);
      }
    },
    error => {
      console.error('Error refreshing installments:', error);
    }
  );
}

markAsPaid(index: number): void {
  console.log('markAsPaid called with index:', index);
  const installment = this.installments.at(index);
  const dueAmount = installment.get('dueAmount')?.value || 0;
  const amount = installment.get('amount')?.value;
  const currentPaidAmount = installment.get('paidAmount')?.value || 0;
  const remainingAmount = amount - currentPaidAmount;
   console.log('Payment details:', { dueAmount, amount, currentPaidAmount, remainingAmount });
  this.currentInstallmentIndex = index;
  this.installmentAmount = amount;
  this.remainingAmount = remainingAmount;
  
  if (dueAmount > 0) {
    
    this.paymentAmount = dueAmount;
    this.paymentType = 'partial';
    this.showPaymentPrompt = true;
  } else {
    
    this.paymentAmount = remainingAmount;
    this.paymentType = 'full';
    this.showPaymentPrompt = true;
  }
  console.log('showPaymentPrompt set to:', this.showPaymentPrompt);
  console.log('paymentAmount:', this.paymentAmount);
  console.log('paymentType:', this.paymentType);
}


confirmPayment(): void {
  if (this.currentInstallmentIndex === null) return;

  let paymentAmount = this.paymentAmount;
  
  if (this.paymentType === 'full') {
    paymentAmount = this.remainingAmount;
  }

  if (paymentAmount <= 0 || paymentAmount > this.remainingAmount) {
    this.snackBar.open('Invalid payment amount', 'Close', { duration: 3000 });
    return;
  }

  this.processPayment(this.currentInstallmentIndex, this.paymentType, paymentAmount);
  this.closePaymentPrompt();
}

// Method to close the prompt
closePaymentPrompt(): void {
  this.showPaymentPrompt = false;
  this.currentInstallmentIndex = null;
  this.paymentAmount = 0;
  this.paymentType = 'partial';
  this.remainingAmount = 0;
  this.installmentAmount = 0;
}

// Method to set quick amount
// setQuickAmount(percentage: number): void {
//   this.paymentType = 'partial';
//   this.paymentAmount = Math.round((this.remainingAmount * percentage) * 100) / 100;
// }

// Method to handle input changes
onPaymentAmountChange(event: any): void {
  const value = parseFloat(event.target.value);
  if (!isNaN(value)) {
    this.paymentAmount = value;
    this.paymentType = 'partial';
  }
}
}
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccountsService } from '../../services/accounts.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-account-dialog',
  templateUrl: './account-dialog.component.html',
  styleUrls: ['./account-dialog.component.css'],
})
export class AccountDialogComponent implements OnInit {
  contactId: string = '';
  installment: any = null;
  loading: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<AccountDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private accountService: AccountsService,
    private snackBar: MatSnackBar
  ) {
    this.contactId = data.contactId;
  }

  ngOnInit(): void {
    if (this.contactId) {
      this.loadInstallmentDetails();
    } else {
      console.error('No contact ID provided');
      this.snackBar.open('Error: No contact ID provided', 'Close', {
        duration: 3000
      });
      this.loading = false;
    }
  }

loadInstallmentDetails(): void {
  this.loading = true;
  this.accountService.getInstallmentDetails(this.contactId).subscribe(
    (response: any) => {
      console.log('FULL API RESPONSE:', response);
      
      let installmentData = null;
      
      if (response.data) {
        // Use data.installment if it exists, otherwise use data directly
        if (response.data.installment) {
          installmentData = response.data.installment;
        } else {
          installmentData = response.data;
        }
        
        // DEEP DEBUG: Check the actual payment dates structure
        console.log('=== DEEP PAYMENT DATES DEBUG ===');
        if (installmentData.installments) {
          installmentData.installments.forEach((inst: any, index: number) => {
            console.log(`🧾 Installment ${index}:`);
            console.log(`   Amount: ${inst.amount}, Paid: ${inst.paidAmount}, Due: ${inst.due_amount}`);
            console.log(`   Status: ${inst.status}`);
            console.log(`   Payment Dates Array:`, inst.paymentDates);
            console.log(`   Payment Dates Type:`, typeof inst.paymentDates);
            console.log(`   Is Array:`, Array.isArray(inst.paymentDates));
            
            // Debug the actual structure
            console.log(`   Full installment object:`, JSON.stringify(inst, null, 2));
            
            if (inst.paymentDates && Array.isArray(inst.paymentDates)) {
              console.log(`   Number of payments: ${inst.paymentDates.length}`);
              inst.paymentDates.forEach((payment: any, paymentIndex: number) => {
                console.log(`     Payment ${paymentIndex}:`, payment);
              });
            } else {
              console.log(`   ❌ NO PAYMENT DATES ARRAY FOUND`);
            }
          });
        }
        console.log('=== END DEEP DEBUG ===');
      }
      
      this.installment = installmentData;
      this.loading = false;
      
      // Final verification
      this.verifyPaymentDatesDisplay();
    },
    (error) => {
      console.error('Error fetching installment details:', error);
      this.installment = null;
      this.loading = false;
      this.snackBar.open('Error loading account details', 'Close', { duration: 3000 });
    }
  );
}
// Add this method to verify what will be displayed
verifyPaymentDatesDisplay(): void {
  if (this.installment && this.installment.installments) {
    console.log('=== FINAL DISPLAY VERIFICATION ===');
    this.installment.installments.forEach((inst: any, index: number) => {
      console.log(`📱 Installment ${index} will display:`);
      console.log(`   Payment Dates:`, inst.paymentDates);
      console.log(`   Payment Dates Length:`, inst.paymentDates.length);
      
      if (inst.paymentDates.length > 0) {
        console.log(`   ✅ WILL SHOW ${inst.paymentDates.length} PAYMENTS`);
      } else {
        console.log(`   ❌ WILL SHOW NO PAYMENTS`);
      }
    });
  }
}
  getStatusColor(installment: any): string {
    if (installment.status === 'paid') {
      return 'green';
    } else if (installment.status === 'partially_paid') {
      return 'yellow';
    } else if (installment.status === 'pending') {
      return 'yellow';
    } else {
      return 'red';
    }
  }

  getStatusText(installment: any): string {
    if (installment.status === 'paid') {
      return 'Paid';
    } else if (installment.status === 'partially_paid') {
      return 'Partially Paid';
    } else if (installment.status === 'pending') {
      return 'Pending';
    } else {
      return 'Not Paid';
    }
  }

  getDueAmount(installment: any): number {
    // Calculate due amount: original amount minus paid amount
    return installment.amount - (installment.paidAmount || 0);
  }

  getOverallStatusColor(): string {
    if (!this.installment || !this.installment.overallStatus) return 'yellow';
    
    if (this.installment.overallStatus === 'completed') {
      return 'green';
    } else if (this.installment.overallStatus === 'partially_paid') {
      return 'yellow';
    } else {
      return 'red';
    }
  }

  getOverallStatusText(): string {
    if (!this.installment || !this.installment.overallStatus) return 'Unknown';
    
    if (this.installment.overallStatus === 'completed') {
      return 'Completed';
    } else if (this.installment.overallStatus === 'partially_paid') {
      return 'Partially Paid';
    } else {
      return 'Pending';
    }
  }

  get hasInstallments(): boolean {
    return this.installment && 
           this.installment.installments && 
           this.installment.installments.length > 0;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
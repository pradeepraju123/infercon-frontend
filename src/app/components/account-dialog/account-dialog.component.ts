// account-dialog.component.ts
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
      (data: any) => {
        console.log('API Response:', data);
        
        let installmentData = null;
        
        if (data.data && data.data.installment) {
          installmentData = data.data.installment;
        } else if (data.installment) {
          installmentData = data.installment;
        } else if (data.data) {
          installmentData = data.data;
        } else {
          installmentData = data;
        }
        
        if (installmentData && 
            (installmentData.installments || 
             installmentData.overallStatus || 
             Object.keys(installmentData).length > 0)) {
          this.installment = installmentData;
        } else {
          this.installment = null;
        }
        
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching installment details:', error);
        this.installment = null;
        this.loading = false;
      }
    );
  }

  getStatusColor(installment: any): string {
    if (installment.status === 'paid') {
      return 'green';
    } else if (installment.status === 'pending') {
      return 'yellow';
    } else {
      return 'red';
    }
  }

  getStatusText(installment: any): string {
    if (installment.status === 'paid') {
      return 'Paid';
    } else if (installment.status === 'pending') {
      return 'Pending';
    } else {
      return 'Not Paid';
    }
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
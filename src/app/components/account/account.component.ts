// account.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContactService } from '../../services/contact.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountsService } from '../../services/accounts.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  contactId: string = '';
  installment: any = null;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private contactService: ContactService,
    private snackBar: MatSnackBar,
    private accountService: AccountsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.contactId = params['id'];
      console.log('Contact ID:', this.contactId);
      if (this.contactId) {
        this.loadInstallmentDetails();
      } else {
        console.error('No contact ID provided in route parameters');
        this.snackBar.open('Error: No contact ID provided', 'Close', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  loadInstallmentDetails(): void {
    this.loading = true;
    this.accountService.getInstallmentDetails(this.contactId).subscribe(
      (data: any) => {
        console.log('API Response:', data);
        
        // Handle different response structures
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
        
        // Check if we have valid installment data
        if (installmentData && 
            (installmentData.installments || 
             installmentData.overallStatus || 
             Object.keys(installmentData).length > 0)) {
          this.installment = installmentData;
          console.log('Installment data found:', this.installment);
        } else {
          this.installment = null;
          console.log('No installment details found');
        }
        
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching installment details:', error);
        this.installment = null; // Set to null to show "No details found"
        this.loading = false;
      }
    );
  }

  // getStatusColor(installment: any): string {
  //   if (installment.status === 'paid') {
  //     return 'green';
  //   } else {
  //     // Check if installment is overdue
  //     const today = new Date();
  //     const dueDate = new Date(installment.dueDate);
  //     return dueDate < today ? 'red' : 'yellow';
  //   }
  // }
getStatusColor(installment: any): string {
  if (installment.status === 'paid') {
    return 'green';
  } else if (installment.status === 'pending') {
    return 'yellow';
  } else {
    return 'red'; // For not paid/overdue status
  }
}
  // getStatusText(installment: any): string {
  //   if (installment.status === 'paid') {
  //     return 'Paid';
  //   } else {
  //     const today = new Date();
  //     const dueDate = new Date(installment.dueDate);
  //     return dueDate < today ? 'Overdue' : 'Pending';
  //   }
  // }
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
}
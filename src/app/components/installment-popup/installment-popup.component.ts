import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { InstallmentService } from '../installment.service';

@Component({
  selector: 'app-installment-popup',
  templateUrl: './installment-popup.component.html',
  styleUrls: ['./installment-popup.component.css']
})
export class InstallmentPopupComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  selectedPlan: string = '';
  amount: number | null = null;
  noOfInstallments: number | null = null;

  users: any[] = []; // store users from API

  constructor(private installmentService: InstallmentService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.installmentService.getActiveUsers().subscribe({
      next: (res) => {
        if (res.status_code === 200) {
          this.users = res.data;
        }
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });
  }

  closePopup() {
    this.close.emit();
  }

  onSubmit() {
    if (!this.selectedPlan || !this.amount || !this.noOfInstallments) {
      alert("Please fill all fields!");
      return;
    }

    const data = {
      userId: this.selectedPlan,  // ✅ Selected user ID
      amount: this.amount,
      installments: this.noOfInstallments
    };

    console.log("Form Submitted ✅", data);


    this.closePopup();
  }
}

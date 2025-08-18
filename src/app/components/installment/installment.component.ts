import { Component } from '@angular/core';
import { InstallmentService } from '../../services/installments/installment.service';

@Component({
  selector: 'app-installment',
  templateUrl: './installment.component.html',
  styleUrls: ['./installment.component.css']   // ✅ must be styleUrls (array)
})
export class InstallmentComponent {
  showPopup = false;

  userId = "67a10184c8a236613fb8dc4b";   // sample userId
  installments: any[] = [];              // ✅ declare installments

  constructor(private installmentService: InstallmentService) {}

  // Open popup
  openPopup() {
    this.showPopup = true;
  }

  // Close popup
  closePopup() {
    this.showPopup = false;
  }

  // ✅ Fetch or update installments
  updateUser() {
    const payload = {
      id: this.userId,
      totalAmount: 1000,
      noofinstallment: 3
    };

    this.installmentService.updateInstallments(payload).subscribe((res: any) => {
      if (res?.data?.installments) {
        this.installments = res.data.installments;
      }
    });
  }

  // ✅ Pay an installment
  pay(installmentNumber: number) {
    this.installmentService.payInstallment(this.userId, installmentNumber).subscribe((res: any) => {
      if (res?.data?.installments) {
        this.installments = res.data.installments;
      }
    });
  }
}

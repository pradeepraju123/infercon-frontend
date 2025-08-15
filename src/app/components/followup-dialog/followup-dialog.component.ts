// followup-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-followup-dialog',
  templateUrl: './followup-dialog.component.html',
  styleUrls: ['./followup-dialog.component.css']
})
export class FollowupDialogComponent {
  followupDate: Date = new Date();
  hours: string = '';
  minutes: string = '';
  ampm: string = 'AM';

  constructor(
    public dialogRef: MatDialogRef<FollowupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Initialize with current time
    const now = new Date();
    let hours = now.getHours();
    this.ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    this.hours = hours.toString().padStart(2, '0');
    this.minutes = now.getMinutes().toString().padStart(2, '0');
  }

  getFollowupData() {
    // Convert to 24-hour format for storage
    let hours24 = parseInt(this.hours);
    if (this.ampm === 'PM' && hours24 < 12) {
      hours24 += 12;
    } else if (this.ampm === 'AM' && hours24 === 12) {
      hours24 = 0;
    }
    const time24 = `${hours24.toString().padStart(2, '0')}:${this.minutes}`;
    
    return {
      followupDate: this.followupDate,
      followupTime: time24,
      displayTime: `${this.hours}:${this.minutes} ${this.ampm}`
    };
  }
}
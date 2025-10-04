import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { EditContactComponent } from '../../components/edit-contact/edit-contact.component';
import { CommentsDialogComponent } from '../../components/comments-dialog/comments-dialog.component';

export interface DetailsDialogData {
  contact: any;
}

@Component({
  selector: 'app-details-dialog',
  templateUrl: './details-dialog.component.html',
  styleUrls: ['./details-dialog.component.css']
})
export class DetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DetailsDialogData,
    private dialog: MatDialog
  ) {}

  formatTimeForDisplay(time24: string): string {
    if (!time24) return '';
    
    const [hours, minutes] = time24.split(':');
    let hoursNum = parseInt(hours);
    const ampm = hoursNum >= 12 ? 'PM' : 'AM';
    hoursNum = hoursNum % 12;
    hoursNum = hoursNum ? hoursNum : 12;
    return `${hoursNum}:${minutes} ${ampm}`;
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  openEditDialog(): void {
    this.dialogRef.close();
    const dialogRef = this.dialog.open(EditContactComponent, {
      data: { itemId: this.data.contact._id },
      width: '600px'
    });
  }

  openCommentsDialog(): void {
    this.dialogRef.close();
    const dialogRef = this.dialog.open(CommentsDialogComponent, {
      width: '600px',
      data: {
        contactId: this.data.contact._id,
        contactName: this.data.contact.fullname
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
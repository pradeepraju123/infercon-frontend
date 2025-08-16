import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContactService } from '../../services/contact.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-comments-dialog',
  templateUrl: './comments-dialog.component.html',
  styleUrls: ['./comments-dialog.component.css']
})
export class CommentsDialogComponent implements OnInit {
  comments: any[] = [];
  newComment: string = '';
  loading: boolean = false;
  contactName: string = '';

  constructor(
    public dialogRef: MatDialogRef<CommentsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private contactService: ContactService,
    private snackBar: MatSnackBar
  ) {
    this.contactName = data.contactName || 'Contact';
  }

  ngOnInit(): void {
    this.loadComments();
    this.contactName = (this.data.contactName || '').replace(/cc/gi, '').trim();

  }

  loadComments(): void {
    this.loading = true;
    this.contactService.getComments(this.data.contactId).subscribe(
      (response: any) => {
        this.comments = response.comments || [];
        // Sort comments by date (newest first)
        this.comments.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.loading = false;
      },
      (error) => {
        console.error('Error loading comments:', error);
        this.loading = false;
        this.snackBar.open('Error loading comments', 'Close', { duration: 3000 });
      }
    );
  }

  addComment(): void {
    if (!this.newComment.trim()) {
      return;
    }

    this.loading = true;
    this.contactService.addComment(this.data.contactId, this.newComment.trim()).subscribe(
      (response: any) => {
        this.newComment = '';
        this.loadComments(); // Reload comments to show the new one
        this.snackBar.open('Comment added successfully', 'Close', { duration: 3000 });
      },
      (error: any) => {
        console.error('Error adding comment:', error);
        this.loading = false;
        this.snackBar.open('Error adding comment', 'Close', { duration: 3000 });
      }
    );
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.addComment();
    }
  }
}
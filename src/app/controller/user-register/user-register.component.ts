import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ContactService } from '../../services/contact.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { EditContactComponent } from '../../components/edit-contact/edit-contact.component';
import { AuthService } from '../../services/auth.service';
import { CommentsDialogComponent } from '../../components/comments-dialog/comments-dialog.component';
@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css']
})
export class UserRegisterComponent implements OnInit {
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['select', 'fullname', 'email', 'phone', 'course','createdDate','createdTime','comments', 'action'];
  searchTerm: string = '';
  startDate: any = null;
  endDate: any = new Date();
  pageSize = 10;
  pageNum = 1;
  published: any;
  sortBy: any
  userType: any
  userName : any
  userId: any
  totalItems: number = 0;
  totalPages: number = 1;
  itemsPerPage: number = 5;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private contactService: ContactService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService:AuthService
  ) {}

  ngOnInit(): void {
    this.loadRegisteredUsers();
  }

  loadRegisteredUsers() {
  const params = {
    searchTerm: this.searchTerm,
    start_date: this.formatDate(this.startDate),
    end_date: this.formatDate(this.endDate),
    page_size: this.pageSize,
    page_num: this.pageNum
  };

  this.contactService.getRegisteredUsers().subscribe(
    (data: any) => {
      if (data && data.data) {
        // Format the dates for each item
        const formattedData = data.data.map((item: any) => {
          const createdAt = new Date(item.createdAt);
          return {
            ...item,
            created_date: createdAt.toISOString().split('T')[0], // YYYY-MM-DD format
            created_time: createdAt.toTimeString().split(' ')[0] // HH:MM:SS format
          };
        });
        
        this.dataSource = new MatTableDataSource(formattedData);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    },
    (error) => {
      console.error('Error fetching registered users:', error);
      this.openSnackBar('Error loading registered users');
    }
  );
}

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

   getUserName(): string | null {
    const token = sessionStorage.getItem('authToken');
    this.userType = this.authService.getUserTypeFromToken(token)
    if (this.userType === 'staff'){
      this.userName = this.authService.getUserNameFromToken(token)
      return this.userName
    }else{
      return null
    }
    
    
  }
  
   openDialog(_id: String) {
     this.dialog.open(EditContactComponent, {
       data: {
         itemId: _id,
       }
     });
     this.loadRegisteredUsers()
   }

  downloadUsers() {
    const params = {
      searchTerm: this.searchTerm,
      start_date: this.formatDate(this.startDate),
      end_date: this.formatDate(this.endDate)
    };

    this.contactService.downloadContact(params).subscribe(
      (data: any) => {
        const link = document.createElement('a');
        link.href = data.url;
        link.download = 'registered_users.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.openSnackBar('Download successful');
      },
      (error) => {
        console.error('Error downloading users:', error);
        this.openSnackBar('Error downloading users');
      }
    );
  }

  private formatDate(date: string): string {
    return date ? new Date(date).toISOString() : '';
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  onPageChange(event: any) {
    this.pageSize = event.pageSize;
    this.pageNum = event.pageNum;
    this.loadRegisteredUsers();
  }

  openCommentsDialog(contactId: string, contactName: string): void {
    const dialogRef = this.dialog.open(CommentsDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      data: {
        contactId: contactId,
        contactName: contactName
      },
      panelClass: 'comments-dialog-panel'
    });
  
    // Optional: Handle dialog close event
    dialogRef.afterClosed().subscribe(result => {
      this.loadRegisteredUsers();
    });
  }
  getPageNumbers(): number[] {
  const maxPagesToShow = 5;
  let startPage = Math.max(1, this.pageNum - 2);
  let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
  
  // Adjust if we're at the end
  if (endPage - startPage < maxPagesToShow - 1 && startPage > 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  return Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i);
}

getStartItem(): number {
  return (this.pageNum - 1) * this.itemsPerPage + 1;
}

getEndItem(): number {
  return Math.min(this.pageNum * this.itemsPerPage, this.totalItems);
}

goToPage(page: number): void {
  if (page >= 1 && page <= this.totalPages && page !== this.pageNum) {
    this.pageNum = page;
    this.loadRegisteredUsers();
  }
}

goToFirstPage(): void {
  if (this.pageNum > 1) {
    this.goToPage(1);
  }
}

goToPreviousPage(): void {
  if (this.pageNum > 1) {
    this.goToPage(this.pageNum - 1);
  }
}

goToNextPage(): void {
  if (this.pageNum < this.totalPages) {
    this.goToPage(this.pageNum + 1);
  }
}

goToLastPage(): void {
  if (this.pageNum < this.totalPages) {
    this.goToPage(this.totalPages);
  }

}


}
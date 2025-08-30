import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ContactService } from '../../services/contact.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EditContactComponent } from '../../components/edit-contact/edit-contact.component';
import { AuthService } from '../../services/auth.service';
import { CommentsDialogComponent } from '../../components/comments-dialog/comments-dialog.component';
import { CreateRegisteredDialogComponent } from '../../components/create-registered-dialog/create-registered-dialog.component';
import { AccountDialogComponent } from '../../components/account-dialog/account-dialog.component';
@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css']
})
export class UserRegisterComponent implements OnInit {
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['select', 'fullname', 'email', 'phone', 'course', 'createdDateTime', 'comments', 'action', 'Registration','account'];
  searchTerm: string = '';
  startDate: any = null;
  endDate: any = new Date();
  pageSize = 10;
  pageNum = 1;
  published: any;
  sortBy: any;
  userType: any;
  userName: any;
  userId: any;
  totalItems: number = 0;
  totalPages: number = 1;
  itemsPerPage: number = 4;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private contactService: ContactService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRegisteredUsers();
  }

loadRegisteredUsers() {
  const params = {
    searchTerm: this.searchTerm,
    start_date: this.formatDate(this.startDate),
    end_date: this.formatDate(this.endDate),
    page_size: this.itemsPerPage,  // Use itemsPerPage consistently
    page_num: this.pageNum,
  };

  this.contactService.getRegisteredUsers(params).subscribe(  // Pass params here
    (data: any) => {
      if (data && data.data) {
        const formattedData = data.data.map((item: any) => {
          const createdAt = new Date(item.createdAt);
          return {
            ...item,
            created_date: createdAt.toISOString().split('T')[0],
            created_time: createdAt.toTimeString().split(' ')[0]
          };
        });
        
        this.dataSource = new MatTableDataSource(formattedData);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        
        // Update pagination info from backend response
        this.totalItems = data.pagination?.total_items || data.data.length;
        this.totalPages = data.pagination?.total_pages || Math.ceil(this.totalItems / this.itemsPerPage);
        this.itemsPerPage = data.pagination?.items_per_page || this.itemsPerPage;
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

 openCreateRegistrationDialog(user: any): void {
    const dialogRef = this.dialog.open(CreateRegisteredDialogComponent, {
      width: '600px',
      data: { user } // Pass the user data to the dialog
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRegisteredUsers(); // Refresh the list if a new registration was created
      }
    });
  }
viewAccountModal(contactId: string): void {
  if (contactId) {
    const dialogRef = this.dialog.open(AccountDialogComponent, {
      width: '90%',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: { contactId: contactId }
    });
  } else {
    console.error('No contact ID provided for modal');
    this.openSnackBar('Error: No contact ID available');
  }
}
}











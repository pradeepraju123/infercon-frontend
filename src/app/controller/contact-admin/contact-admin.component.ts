import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ContactService } from '../../services/contact.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {SelectionModel} from '@angular/cdk/collections';
import { MatSort, Sort } from '@angular/material/sort';
import {
  MatDialog,
} from '@angular/material/dialog';
import { EditContactComponent } from '../../components/edit-contact/edit-contact.component';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { CommentsDialogComponent } from '../../components/comments-dialog/comments-dialog.component';
import { CreateRegisteredDialogComponent } from '../../components/create-registered-dialog/create-registered-dialog.component';
import { FollowupDialogComponent } from '../../components/followup-dialog/followup-dialog.component';
import { Router } from '@angular/router';
import { CreateUserComponent } from '../../components/create-user/create-user.component';
@Component({
  selector: 'app-contact-admin',
  templateUrl: './contact-admin.component.html',
  styleUrl: './contact-admin.component.css'
})
export class ContactAdminComponent implements AfterViewInit {
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['fullname', 'phone', 'course', 'createdAt', 'leadSelection','assigneeSelection','Action', 'SendMessage'];
  leadOptions: string[] = ['New lead', 'Contacted', 'Followup', 'Not interested', 'Finalized'];
  assigneeOptions: string[] = [];
  contactId!: string
  filteredTrainings: any[] = []; // Add a property to store filtered data
  searchTerm: string = '';
  startDate: any = null;
  endDate: any = new Date();
  singleStartDate: Date | null = null;
  singleEndDate: Date | null = null;
  published: any;
  sortBy: any
  pageSize = 5;
  pageNum = 1;
  totalItems: number = 0;
totalPages: number = 1;
itemsPerPage: number = 5;
  data : any
  userType: any
  userName : any
  userId: any
  AdminDetails: any
  selected_ids : any
  selectedAssignee : any
  successMessage: string | null = null;
  errorMessage: string | null = null;
  testMessage: string = 'Test Message'
  selectedContactId: string = '';
  newComment: string = '';
  showComments: string | null = null;
  contactComments: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  selection = new SelectionModel<any>(true, []);
  constructor(private contactServices: ContactService, 
    private _liveAnnouncer: LiveAnnouncer, 
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,  
    private getUsername: UserService, 
    private authService: AuthService,
    private contactService: ContactService,
    private router:Router

    ) {}
    selectedFile: File | null = null;
  fileError: string | null = null;


  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();

      if (fileExtension !== 'xls' && fileExtension !== 'xlsx') {
        this.fileError = "Only Excel files (.xls, .xlsx) are allowed!";
        return;
      }

      this.fileError = null;
      this.selectedFile = file;
    }
  }

  
  getUser() {
    this.getUsername.getAllUsers().subscribe(
      (data: any) => {
        this.assigneeOptions = data.data
        .filter((user: any) => user.userType === "staff")
        .map((user: any) => user.name);
      },
      (error) => {
        console.error('Error while get user:', error);
      }
    );
  }
  getUserType(): string | null {
    const token = sessionStorage.getItem('authToken'); // Assuming this function exists in your authService
    this.userType = this.authService.getUserTypeFromToken(token)
    if (this.userType === 'staff') {
      this.displayedColumns = ['select', 'fullname', 'phone', 'course', 'createdDateTime', 'leadSelection', 'followupDate', 'followupTime', 'comments', 'Action','MarkRegistered'];
    } else if(this.userType === 'admin') {
      this.displayedColumns =  ['select', 'fullname', 'phone', 'course', 'createdDateTime', 'assigneeSelection', 'followupDate', 'followupTime', 'comments', 'Action'];
    }
    return this.userType;
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


async getStaffAdminDetails(): Promise<any | null> {
  const token = sessionStorage.getItem('authToken');
  this.userType = this.authService.getUserTypeFromToken(token);

  if (this.userType === 'staff') {
    this.userId = this.authService.getUserIdFromToken(token);
    
    try {
      const userDetails = await this.getUsername.getUserById(this.userId).toPromise();
      return userDetails;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  } else {
    return null;
  }
}


  openDialog(_id: String) {
    this.dialog.open(EditContactComponent, {
      data: {
        itemId: _id,
      }
    });
    this.loadContacts()
  }
// contact-admin.component.ts - update the onCourseSelectionChange method
async onCourseSelectionChange(selectedLead: string, itemId: string) {
  this.contactId = itemId;

  if (this.contactId) {
    const updateData: any = { lead_status: selectedLead };

    if (selectedLead === 'Followup') {
      const dialogRef = this.dialog.open(FollowupDialogComponent, {
        width: '400px'
      });

      const result = await dialogRef.afterClosed().toPromise();
      
      if (!result) {
        return; // User cancelled
      }

      // Convert the time to proper format if needed
      updateData.followup_date = result.followupDate;
      updateData.followup_time = result.followupTime;
      
      // If you need to ensure the time is in HH:mm format:
      if (updateData.followup_time && typeof updateData.followup_time === 'string') {
        const timeParts = updateData.followup_time.split(':');
        if (timeParts.length === 2) {
          updateData.followup_time = `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
        }
      }
    }

    this.contactServices.updateContact(this.contactId, updateData)
      .subscribe(
        response => {
          console.log('Contact updated successfully:', response);
          const rowIndex = this.dataSource.data.findIndex(item => item._id === this.contactId);
          if (rowIndex !== -1) {
            this.dataSource.data[rowIndex] = { ...this.dataSource.data[rowIndex], ...updateData };
            this.dataSource._updateChangeSubscription();
          }
        },
        error => {
          console.error('Error updating contact:', error);
        }
      );
  }
}

  onAssigneeSelect(selectedAssignee: string, itemId: string){
    this.contactId = itemId;
  
    if (this.contactId) {
      console.log(this.contactId);
      // Create an object with the lead_status property
      const updateData = { assignee: selectedAssignee };
     
          // First find the staff details to get their phone number
    this.getUsername.getAllUsers().subscribe(
      (users: any) => {
        const staff = users.data.find((u: any) => u.name === selectedAssignee);
        if (staff) {
          // Update the contact
          this.contactServices.updateContact(this.contactId, updateData)
            .subscribe(
              response => {
                console.log('Contact updated successfully:', response);
                
                // Send WhatsApp notification to staff
                const lead = this.dataSource.data.find(item => item._id === this.contactId);
                if (lead) {
                  this.contactServices.sendLeadNotification(
                    staff.name,
                    staff.phone_number,
                    lead.fullname,
                    lead.email,
                    lead.phone,
                    lead.courses
                  ).subscribe(
                    notificationResponse => {
                      console.log('Notification sent:', notificationResponse);
                    },
                    error => {
                      console.error('Error sending notification:', error);
                    }
                  );
                }
              },
              error => {
                console.error('Error updating contact:', error);
              }
            );
        }
      },
      error => {
        console.error('Error fetching users:', error);
      }
    );
  }

    // Find the index of the current row in the dataSource array
    const rowIndex = this.dataSource.data.findIndex(item => item.itemId === itemId);
  
    // Update the selected course for the current row
    this.dataSource.data[rowIndex].assignee = selectedAssignee;
  
    // You can perform additional actions based on the selected course
    console.log('Selected Assignee:', selectedAssignee);
  }
  
   
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    
    this.getUser();
    this.getUserType();
    this.getUserName()
    this.loadContacts();
    // this.loadRegisteredLeads();
  }
  loadContacts() {
  const params:any = {
    searchTerm: this.searchTerm,
    start_date: this.formatDate(this.startDate),
    end_date: this.formatDate(this.endDate),
    published: this.published,
    sort_by: this.sortBy,
   page_size: this.itemsPerPage,
    page_num: this.pageNum,
    assignee: this.getUserName()
  };
   if (this.userType === 'staff') {
    params.assignee = this.userName;
  }
  this.contactServices.getAllContact(params).subscribe(
    (data: any) => {
      if (data && data.data && data.data.length > 0) {
        // Sort comments for each contact by createdAt in descending order
        const contactsWithSortedComments = data.data.map((contact: any) => {
          if (contact.comments && contact.comments.length > 0) {
            contact.comments.sort((a: any, b: any) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
          return { ...contact, itemId: contact.id };
        });
        
        this.dataSource = new MatTableDataSource(contactsWithSortedComments);
        this.totalItems = data.pagination?.total_items || data.data.length;
        this.totalPages = data.pagination?.total_pages || Math.ceil(this.totalItems / this.itemsPerPage);
      } else {
        this.dataSource = new MatTableDataSource<any>([]);
      } 
    },
    (error) => {
      console.error('Error fetching registered leads:', error);
    }
  );
}
  
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
        this.selection.selected.forEach(s => console.log(s._id));
  }

async bulkAction() {
  if (this.selectedAssignee) {
    this.selected_ids = await this.getSelectedIds();
    
    if (this.selected_ids && this.selected_ids.length > 0) {
      const updateData: any = { assignee: this.selectedAssignee };

      // If any selected contact is being set to Followup, show dialog
      const hasFollowup = this.selection.selected.some(item => 
        item.lead_status === 'Followup' || 
        (this.dataSource.data.find(d => d._id === item._id)?.lead_status === 'Followup')
      );

      if (hasFollowup) {
        const dialogRef = this.dialog.open(FollowupDialogComponent, {
          width: '400px'
        });

        const result = await dialogRef.afterClosed().toPromise();
        
        if (!result) {
          // User cancelled, don't update
          return;
        }

        updateData.followup_date = result.followupDate;
        updateData.followup_time = result.followupTime;
      }

      this.contactServices.updateContactBulk(this.selected_ids, updateData)
        .subscribe(
          response => {
            console.log('Contacts updated successfully:', response);
            this.loadContacts();
          },
          error => {
            console.error('Error updating contacts:', error);
          }
        );
    }
  }
}


  async SendBulkMessage() {
      // Get the selected_ids asynchronously
      this.selected_ids = await this.getSelectedIds();
  
      console.log(this.selected_ids);
  
      if (this.selected_ids && this.selected_ids.length > 0) {
  
        this.contactServices.sendMessageToUser(this.selected_ids, this.testMessage).subscribe(
          response => {
            this.successMessage = 'Send bulk Message successfully.';
            console.log('Send Notification successfully:', response);
            this.openSnackBar(this.successMessage)
          },
          error => {
            console.error('Error while send notification:', error);
          });
        this.loadContacts()
      }
  }

    private async getSelectedIds(): Promise<string[]> {
      return new Promise<string[]>((resolve, reject) => {
        const selectedIds = this.selection.selected.map(s => s._id);
        if (selectedIds && selectedIds.length > 0) {
          resolve(selectedIds);
        } else {
          reject('No selected IDs found.');
        }
      });
    }
  
  downloadContacts() {
    const params = {
      searchTerm: this.searchTerm,
      start_date: this.formatDate(this.startDate),
      end_date: this.formatDate(this.endDate),
      published: this.published,
      sort_by: this.sortBy,
      assignee: this.getUserName()
    };
    this.contactServices.downloadContact(params).subscribe(
      (data: any) => {
          this.successMessage = 'Download Contact successfully.';
          this.errorMessage = null;
           // Create a temporary link element
          const link = document.createElement('a');
          link.href = data.url;
          link.download = 'contacts.xlsx'; // Set the file name
          document.body.appendChild(link);
          
          // Trigger the click event to start the download
          link.click();

          // Remove the link from the document
          document.body.removeChild(link);

          this.openSnackBar(this.successMessage)
      },
      (error) => {
        console.error('Error fetching contact data:', error);
        this.errorMessage = 'Error while download contact';
        this.successMessage = null;
        this.openSnackBar(this.errorMessage)
      }
    );
  }
  // Function to handle page change event
  
   onPageChange(event: any) {
    this.pageSize = event.pageSize;
    this.pageNum = event.pageNum;
    this.loadContacts(); // Call your search function to fetch data
  }
  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
  private formatDate(date: string): string {
    return new Date(date).toISOString();
  }
  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', 
    {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

// toggleComments(contactId: string): void {
//   this.showComments = this.showComments === contactId ? null : contactId;
//   if (this.showComments) {
//     this.loadComments(contactId);
//   }
// }

// loadComments(contactId: string): void {
//   this.contactService.getComments(contactId).subscribe(
//     (response: any) => {
//       this.contactComments = response.comments || [];
//     },
//     (error) => {
//       console.error('Error loading comments:', error);
//     }
//   );
// }

// addComment(contactId: string): void {
//   if (!this.newComment.trim()) return;

//   this.contactService.addComment(contactId, this.newComment).subscribe(
//     (response: any) => {
//       this.newComment = '';
//       this.loadComments(contactId);
    
//     },
//     (error: any) => {
//       console.error('Error adding comment:', error);
//     }
//   );
// }

// toggleComments(contactId: string): void {
//   this.showComments = this.showComments === contactId ? null : contactId;
//   if (this.showComments) {
//     this.loadComments(contactId);
//   }
//}
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
    // Refresh the contact data to update comment counts
    this.loadContacts();
  });
}
openCreateRegisteredDialog(): void {
  const dialogRef = this.dialog.open(CreateRegisteredDialogComponent, {
    width: '600px'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.loadContacts(); // Refresh the contacts list if a new one was created
    }
  });
}
openCreateUserDialog(): void {
  const dialogRef = this.dialog.open(CreateUserComponent, {
    width: '800px'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.loadContacts(); // Refresh the list if a new user was created
    }
  });
}
// Add this method
getRowColor(leadStatus: string): string {
  console.log('Lead status:', leadStatus); // Check console for output
  switch(leadStatus) {
    case 'New lead': return 'rgba(58, 167, 244, 0.2)';
    case 'Contacted': return 'rgba(173, 216, 230, 0.3)';
    case 'Followup': return 'rgba(255, 255, 0, 0.2)';
    case 'Not interested': return 'rgba(255, 0, 0, 0.1)';
    case 'Finalized': return 'rgba(0, 128, 0, 0.15)';
    default: return '';
  }
}

getLeadStatusClass(status: string): string {
  if (!status) return '';
  // Convert status to lowercase and remove spaces for CSS class
  const statusClass = status.toLowerCase().replace(/\s+/g, '-');
  return `mat-select-${statusClass}`;
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
    this.loadContacts();
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
markAsRegistered(contactId: string): void {
  const contact = this.dataSource.data.find(item => item._id === contactId);
  if (!contact) {
    this.errorMessage = 'Contact not found';
    this.openSnackBar(this.errorMessage);
    return;
  }
  // Add validation for lead status
  if (contact.lead_status !== 'Finalized') {
    this.errorMessage = 'Only Finalized leads can be marked as registered';
    this.openSnackBar(this.errorMessage);
    return;
  }

  this.contactService.markAsRegistered(contactId).subscribe(
    (response) => {
      this.successMessage = 'Lead marked as registered successfully';
      this.openSnackBar(this.successMessage);
      this.loadContacts(); // Refresh the list
      this.router.navigate(['/user-register'])
    },
    (error) => {
      this.errorMessage = 'Error marking lead as registered';
      this.openSnackBar(this.errorMessage);
      console.error('Error marking lead as registered:', error);
    });
  }
  
formatTimeForDisplay(time24: string): string {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':');
  let hoursNum = parseInt(hours);
  const ampm = hoursNum >= 12 ? 'PM' : 'AM';
  hoursNum = hoursNum % 12;
  hoursNum = hoursNum ? hoursNum : 12; // Convert 0 to 12
  return `${hoursNum}:${minutes} ${ampm}`;
}
sendLeadDetails(contactId: string) {
  if (contactId) {
    this.contactServices.sendLeadDetailsToStaff([contactId]).subscribe(
      response => {
        this.successMessage = 'Lead details sent successfully';
        this.openSnackBar(this.successMessage);
        console.log('Lead details sent successfully:', response);
      },
      error => {
        console.error('Error sending lead details:', error);
        this.errorMessage = 'Error sending lead details';
        this.openSnackBar(this.errorMessage);
      }
    );
  }
}
}

// loadRegisteredLeads() {
//   const params: any = {
//     page_size: this.pageSize,
//     page_num: this.pageNum
//   };

//   // If user is staff, only show their assigned registered leads
//   if (this.userType === 'staff') {
//     params.assignee = this.userName;
//   }

//   this.contactService.getRegisteredUsers(params).subscribe(
//     (data: any) => {
//       if (data && data.data && data.data.length > 0) {
//         const contactsWithSortedComments = data.data.map((contact: any) => {
//           if (contact.comments && contact.comments.length > 0) {
//             contact.comments.sort((a: any, b: any) => 
//               new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//             );
//           }
//           return { ...contact, itemId: contact.id };
//         });
        
//         this.dataSource = new MatTableDataSource(contactsWithSortedComments);
//         this.totalItems = data.total || data.data.length;
//         this.totalPages = Math.ceil(this.totalItems / this.pageSize);
//       } else {
//         this.dataSource = new MatTableDataSource<any>([]);
//       }
//     },
//     (error) => {
//       console.error('Error fetching registered leads:', error);
//     }
//   );
// }
// }

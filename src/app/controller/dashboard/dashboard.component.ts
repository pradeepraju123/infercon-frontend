
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
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
import { NotificationService } from '../../services/notification.service';
import { DeleteConfirmationDialogComponent } from '../../components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DetailsDialogComponent } from '../../components/details-dialog/details-dialog.component';
import { AccountDialogComponent } from '../../components/account-dialog/account-dialog.component';
import { AccountsService } from '../../services/accounts.service';
import { InstallmentManagementDialogComponent } from '../../components/installment-management-dialog/installment-management-dialog.component';

interface TrainingStats {
  totalLeads: number;
  registeredLeads: number;
  paidLeads: number;
  rejectedLeads: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent  implements AfterViewInit {
  followupLeads: any[] = [];
  newEnrollments: any[] = [];
  chart: any;
  trainingStats: TrainingStats = {
    totalLeads: 0,
    registeredLeads: 0,
    paidLeads: 0,
    rejectedLeads: 0,
  };
  
   newLeadsDataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  followupDataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  followupLeadsDataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  newLeadsDisplayedColumns: string[] = this.getUserType() === 'admin' 
  ? ['select', 'fullname', 'phone', 'email', 'course', 'assigneeSelection', 'leadSelection', 'followupDateTime','assignedDateTime','comments', 'Action']
  : ['select', 'fullname', 'phone', 'email', 'course', 'leadSelection', 'followupDateTime','assignedDateTime','comments', 'Action'];
  followupDisplayedColumns: string[] = this.getUserType() === 'admin' 
  ? ['select', 'fullname', 'phone', 'email', 'course', 'assigneeSelection', 'leadSelection', 'followupDateTime','assignedDateTime','comments', 'Action']
  : ['select', 'fullname', 'phone', 'email', 'course', 'leadSelection', 'followupDateTime','assignedDateTime','comments', 'Action'];
  followupLeadsDisplayedColumns: string[] = this.getUserType() === 'admin' 
  ? ['select', 'fullname', 'phone', 'email', 'course', 'assigneeSelection', 'leadSelection', 'followupDateTime','assignedDateTime','comments', 'Action']
  : ['select', 'fullname', 'phone', 'email', 'course', 'leadSelection', 'followupDateTime','assignedDateTime','comments', 'Action'];
  registeredDataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  registeredDisplayedColumns: string[] = this.getUserType() === 'admin' 
  ? ['select', 'fullname', 'phone', 'email', 'course', 'assigneeSelection','registeredDate', 'status','Action']
  :['select', 'fullname', 'phone', 'email', 'course','registeredDate', 'status','Action']
  registeredSelection = new SelectionModel<any>(true, []);
  newLeadsSelection = new SelectionModel<any>(true, []);
  followupSelection = new SelectionModel<any>(true, []);
  followupLeadsSelection = new SelectionModel<any>(true, []);
  finalizedDataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  finalizedDisplayedColumns: string[] = this.getUserType() === 'admin' 
   ?['select', 'fullname', 'phone', 'email', 'course','assigneeSelection','Registration', 'assignedDateTime', 'comments', 'markRegistered', 'Action']
   :['select', 'fullname', 'phone', 'email', 'course','Registration', 'assignedDateTime', 'comments', 'markRegistered', 'Action']
  finalizedSelection = new SelectionModel<any>(true, []);
  accountsDataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  accountsDisplayedColumns: string[] = ['contactName', 'email', 'phone', 'totalAmount', 'pendingAmount', 'paidAmount', 'pendingInstallments', 'installmentActions','overallStatus', 'actions'];
  accountsSelection = new SelectionModel<any>(true, []);
    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
    displayedColumns: string[] = ['fullname', 'phone','email', 'course', 'createdAt', 'leadSelection','assigneeSelection','Action', 'SendMessage'];
    leadOptions: string[] = ['New lead', 'Contacted', 'Followup', 'Not interested', 'Finalized','Positive','Medium'];
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
    pageSize = 100;
    pageNum = 1;
    totalItems: number = 0;
  totalPages: number = 1;
  itemsPerPage: number = 100;
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
     // New Leads table pagination
    newLeadsPageNum = 1;
    newLeadsTotalPages = 1;
    newLeadsTotalItems = 0;
    newLeadsItemsPerPage = 5;
  
    // Followup table pagination
    followupPageNum = 1;
    followupTotalPages = 1;
    followupTotalItems = 0;
    followupItemsPerPage = 5;
    //total followup
    followupLeadsPageNum = 1;
    followupLeadsTotalPages = 1;
    followupLeadsTotalItems = 0;
    followupLeadsItemsPerPage = 5
    // Registered Leads table pagination
    registeredPageNum = 1;
    registeredTotalPages = 1;
    registeredTotalItems = 0;
    registeredItemsPerPage = 5;
    // Finalized table pagination
    finalizedPageNum = 1;
    finalizedTotalPages = 1;
    finalizedTotalItems = 0;
    finalizedItemsPerPage = 5;  
    // Accounts pagination
    accountsPageNum = 1;
    accountsTotalPages = 1;
    accountsTotalItems = 0;
    accountsItemsPerPage = 5;
  
    nnewComment: string = '';
    showComments: string | null = null;
    contactComments: any[] = [];
    notifications: any[] = [];
    unreadCount: number = 0;
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
      private router:Router,
      private notificationService: NotificationService,
      private accountService:AccountsService,
      private userService: UserService,
      
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
  const token = sessionStorage.getItem('authToken');
  this.userType = this.authService.getUserTypeFromToken(token);
  this.userId = this.authService.getUserIdFromToken(token)
  
  if (this.userType === 'staff') {
    this.userName = this.authService.getUserNameFromToken(token);
  } else if (this.userType === 'admin') {
    this.userName = this.authService.getUserNameFromToken(token); 
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
  
  openDialog(_id: string) {
    const dialogRef = this.dialog.open(EditContactComponent, {
      data: { itemId: _id }
    });
  
    dialogRef.afterClosed().subscribe((updatedContact) => {
      if (updatedContact) {
        const index = this.dataSource.data.findIndex(c => c._id === updatedContact._id);
        if (index !== -1) {
          this.dataSource.data[index] = { ...this.dataSource.data[index], ...updatedContact };
          this.dataSource._updateChangeSubscription(); // refresh UI
        } else {
        
          this.refreshAllTables();
        }
      }
    });
  }
  
  async onCourseSelectionChange(selectedLead: string, itemId: string) {
    this.contactId = itemId;
  
    if (this.contactId) {
      const updateData: any = { lead_status: selectedLead };
  
      if (selectedLead === 'Followup' || selectedLead === 'Positive' || selectedLead === 'Medium') {
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
            this.refreshAllTables();
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
  
  onAssigneeSelect(selectedAssignee: string, itemId: string) {
    this.contactId = itemId;
    if (!this.contactId) {
      console.error('No contact ID provided');
      return;
    }
    const rowIndex = this.dataSource.data.findIndex(item => item._id === itemId);
    if (rowIndex === -1) {
      console.error('Contact not found in dataSource');
      return;
    }
    
    const lead = this.dataSource.data[rowIndex];
    this.dataSource.data[rowIndex].assignee = selectedAssignee;
    this.dataSource._updateChangeSubscription();
    this.contactServices.onAssigneeSelect(selectedAssignee, itemId).subscribe({
      next: (response: any) => {
        console.log('Contact assigned and notification created:', response);
        this.notificationService.notifyUpdate();
        this.successMessage = `Contact assigned to ${selectedAssignee} successfully. Notification sent!`;
        this.openSnackBar(this.successMessage);
        this.refreshAllTables();
        if (response.notification) {
          console.log('Notification created:', response.notification);
          if (this.userId) {
            this.loadNotifications();
            this.loadUnreadCount();
          }
        }
      },
      error: (err: any) => {
        console.error('Error:', err);
        this.errorMessage = 'Error assigning contact';
        this.openSnackBar(this.errorMessage);
      }
    });
  }
  
  loadNotifications(): void {
      this.notificationService.getUserNotifications(this.userId!)
        .subscribe(res => {
          this.notifications = res.data; // backend returns {status, data}
        });
    }
    loadUnreadCount(): void {
      this.notificationService.getUnreadCount(this.userId!)
        .subscribe(res => {
          this.unreadCount = res.count;
        });
    }
    markAsRead(id: string): void {
      this.notificationService.markAsRead(id).subscribe(() => {
        this.loadNotifications();
        this.loadUnreadCount();
      });
    }
    markAllAsRead(): void {
      this.notificationService.markAllAsRead(this.userId!)
        .subscribe(() => {
          this.loadNotifications();
          this.loadUnreadCount();
        });
    }
     
    ngAfterViewInit(): void {
      this.dataSource.paginator = this.paginator;
       console.log('🔄 [DEBUG] Checking assigned date/time in dataSource:');
    this.newLeadsDataSource.data.forEach((item, index) => {
      console.log(`Item ${index}:`, {
        name: item.fullname,
        assigned_date: item.assigned_date,
        assigned_time: item.assigned_time,
        hasAssignedDate: !!item.assigned_date,
        hasAssignedTime: !!item.assigned_time
      });
    });
    }
  
    ngOnInit(): void {

  //      console.log('🔐 User Type:', this.getUserType());
  // console.log('👤 User Name:', this.userName);
  // console.log('🆔 User ID:', this.userId);
      
      this.getUser();
      this.getUserType();
      this.getUserName()
      this.loadStaffDashboard();
      this.loadContacts();
      this.loadFollowupLeads();
      this.loadRegisteredLeads();
      this.loadFinalizedLeads();
      this.loadAccounts();
      this.loadDashboardData();
    
  }
      // this.loadRegisteredLeads();
 
    loadContacts() {
    const params:any = {
      searchTerm: this.searchTerm,
      start_date: this.formatDate(this.startDate),
      end_date: this.formatDate(this.endDate),
      published: this.published,
      sort_by: this.sortBy,
     page_size: this.itemsPerPage,
      page_num: this.pageNum,
      assignee: this.getUserName(),
      exclude_registered:true,
    };
     if (this.userType === 'staff') {
      params.assignee = this.userName;
    }
    this.contactServices.getNonRegisteredContacts(params).subscribe(
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
    
  refreshAllTables(): void {
    if (this.userType === 'staff' || this.userType === 'admin') {
      this.loadStaffDashboard();
      this.loadContacts(); 
      this.loadFollowupLeads();
      this.loadFinalizedLeads();
      this.loadRegisteredLeads(); 
      this.loadAccounts();
      this.loadDashboardData();
    } else {
      this.loadContacts(); 
    }
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
      this.refreshAllTables();
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
      width: '800px',
      data: {} 
    });
  
    dialogRef.afterClosed().subscribe((createdUser: any) => {
      if (createdUser) {
        console.log('New user created:', createdUser);
        
        // Refresh the contact list
        this.refreshAllTables();
        
        // Show confirmation message
        this._snackBar.open(`User "${createdUser.fullname}" added to the list!`, 'Close', {
          duration: 3000
        });
      }
    });
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
    // Search in ALL data sources
    let contact = this.findContactInAllDataSources(contactId);
    
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
        this.refreshAllTables(); // Refresh all tables
        // this.router.navigate(['/user-register'])
      },
      (error) => {
        this.errorMessage = 'Error marking lead as registered';
        this.openSnackBar(this.errorMessage);
        console.error('Error marking lead as registered:', error);
      });
  }
  
  // Add this helper method to search in all data sources
  private findContactInAllDataSources(contactId: string): any {
    const allDataSources = [
      this.dataSource.data,
      this.newLeadsDataSource.data,
      this.followupDataSource.data,
      this.followupLeadsDataSource.data,
      this.finalizedDataSource.data,
      this.registeredDataSource.data
    ];
    
    for (const data of allDataSources) {
      const contact = data.find(item => item._id === contactId);
      if (contact) return contact;
    }
    return null;
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
  hasNewNotifications(assignee: string): boolean {
    if (!this.notifications || this.notifications.length === 0) {
      return false;
    }
    // Check if there are any unread notifications for this assignee
    return this.notifications.some(notification =>
      !notification.isRead &&
      notification.message.includes(assignee)
    );
  }
  private createWebsiteNotification(selectedAssignee: string, itemId: string, contactData: any): void {
    // Find the staff user to get their ID
    this.getUsername.getAllUsers().subscribe({
      next: (users: any) => {
        const staffUser = users.data.find((user: any) => user.name === selectedAssignee);
        if (staffUser && staffUser._id) {
          const notificationMessage = `You have been assigned a new lead: ${contactData.fullname} - ${contactData.courses} (${contactData.phone})`;
          // Call the notification service to create website notification
          this.notificationService.createNotification({
            userId: staffUser._id,
            message: notificationMessage,
            type: 'assignment',
            relatedContact: itemId
          }).subscribe({
            next: (notificationResponse: any) => {
              console.log('Website notification created:', notificationResponse);
            },
            error: (error: any) => {
              console.error('Error creating website notification:', error);
            }
          });
        }
      },
      error: (error: any) => {
        console.error('Error fetching users for notification:', error);
      }
    });
  }
  
  editFollowup(contact: any): void {
    const dialogRef = this.dialog.open(FollowupDialogComponent, {
      width: '400px',
      data: {
        followupDate: contact.followup_date,
        followupTime: contact.followup_time
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updateData: any = {
          followup_date: result.followupDate,
          followup_time: result.followupTime
        };
  
        // Format time if needed
        if (updateData.followup_time && typeof updateData.followup_time === 'string') {
          const timeParts = updateData.followup_time.split(':');
          if (timeParts.length === 2) {
            updateData.followup_time = `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
          }
        }
  this.contactServices.updateContact(contact._id, updateData).subscribe(
    response => {
      console.log('Follow-up updated successfully:', response);
  
      // Update local dataSource immediately
      const index = this.newLeadsDataSource.data.findIndex(item => item._id === contact._id);
      if (index !== -1) {
        this.newLeadsDataSource.data[index].followup_date = updateData.followup_date;
        this.newLeadsDataSource.data[index].followup_time = updateData.followup_time;
        this.newLeadsDataSource._updateChangeSubscription(); // Important to refresh the table
      }
  
      const followupIndex = this.followupDataSource.data.findIndex(item => item._id === contact._id);
      if (followupIndex !== -1) {
        this.followupDataSource.data[followupIndex].followup_date = updateData.followup_date;
        this.followupDataSource.data[followupIndex].followup_time = updateData.followup_time;
        this.followupDataSource._updateChangeSubscription();
      }
  
      // Reload “today’s followups” if needed
      this.loadTodaysFollowups();
  
      this.openSnackBar('Follow-up updated successfully');
    },
    error => {
      console.error('Error updating follow-up:', error);
      this.openSnackBar('Error updating follow-up');
    }
  );
  
      }
    });
  }
  deleteContact(contactId: string): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '400px',
      panelClass: 'custom-delete-dialog'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.contactService.softDeleteContact(contactId).subscribe(
          (response) => {
            this.successMessage = 'Contact deleted successfully';
            this.openSnackBar(this.successMessage);
            this.refreshAllTables(); 
          },
          (error) => {
            this.errorMessage = 'Error deleting contact';
            this.openSnackBar(this.errorMessage);
            console.error('Error deleting contact:', error);
          }
        );
      }
    });
  }
  restoreContact(contactId: string): void {
    if (confirm('Are you sure you want to restore this contact?')) {
      this.contactService.restoreContact(contactId).subscribe(
        (response) => {
          this.successMessage = 'Contact restored successfully';
          this.openSnackBar(this.successMessage);
          this.loadContacts(); // Refresh the list
        },
        (error) => {
          this.errorMessage = 'Error restoring contact';
          this.openSnackBar(this.errorMessage);
          console.error('Error restoring contact:', error);
        }
      );
    }
  }
  openDetailsDialog(contact: any): void {
    const dialogRef = this.dialog.open(DetailsDialogComponent, {
      width: '750px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        contact: contact
      },
      panelClass: 'details-dialog-panel'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      // Refresh data if needed after dialog closes
      if (result === 'refresh') {
        this.loadContacts();
      }
    });
  }
  
  isAllNewLeadsSelected() {
    const numSelected = this.newLeadsSelection.selected.length;
    const numRows = this.newLeadsDataSource.data.length;
    return numSelected === numRows;
  }
  
  newLeadsMasterToggle() {
    this.isAllNewLeadsSelected() ?
      this.newLeadsSelection.clear() :
      this.newLeadsDataSource.data.forEach(row => this.newLeadsSelection.select(row));
  }
  
  isAllFollowupsSelected() {
    const numSelected = this.followupSelection.selected.length;
    const numRows = this.followupDataSource.data.length;
    return numSelected === numRows;
  }
  
  followupMasterToggle() {
    this.isAllFollowupsSelected() ?
      this.followupSelection.clear() :
      this.followupDataSource.data.forEach(row => this.followupSelection.select(row));
  }
  
  loadStaffDashboard() {
    this.loadNewLeads();
    this.loadTodaysFollowups();
    this.loadAccounts()
  }
  loadNewLeads() {
    const params: any = {
      searchTerm: this.searchTerm,
      start_date: this.formatDate(this.startDate),
      end_date: this.formatDate(this.endDate),
      page_size: this.newLeadsItemsPerPage,
      page_num: this.newLeadsPageNum,
      // assignee: this.userName,
      exclude_registered: true,
      lead_status: 'New lead'
    };
  
    console.log(' loadNewLeads params:', params);
    console.log('userName:', this.userName);
    console.log(' userType:', this.userType);
  if (this.userType === 'staff') {
    params.assignee = this.userName;
  }
     this.contactServices.getNonRegisteredContacts(params).subscribe(
      (data: any) => {
        console.log('Assigned date/time in response:', data.data.map((d: any) => ({
          id: d._id,
          name: d.fullname,
          assignee: d.assignee,
          assigned_date: d.assigned_date,
          assigned_time: d.assigned_time
        })));
        console.log(' API Response:', data);
        
        if (data && data.data && data.data.length > 0) {
          console.log(' Raw data received:', data.data);
           console.log(' New leads data received:', data.data.length, 'items');
          
          // Double filter to ensure only "New lead" status
          const newLeadsOnly = data.data.filter((contact: any) => {
            console.log('Contact status:', contact._id, contact.fullname, contact.lead_status);
            return contact.lead_status === 'New lead';
          });
          
          console.log('After filtering new leads:', newLeadsOnly.length);
          
          const contactsWithSortedComments = newLeadsOnly.map((contact: any) => {
            if (contact.comments && contact.comments.length > 0) {
              contact.comments.sort((a: any, b: any) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            }
             console.log('Contact assigned data:', {
              name: contact.fullname,
              assigned_date: contact.assigned_date,
              assigned_time: contact.assigned_time,
              assignee: contact.assignee
            });
           return { ...contact, itemId: contact.id,assigned_date: contact.assigned_date ? new Date(contact.assigned_date) : null };
          });
          
          this.newLeadsDataSource = new MatTableDataSource(contactsWithSortedComments);
          this.newLeadsTotalItems = data.pagination?.total_items || contactsWithSortedComments.length;
          this.newLeadsTotalPages = data.pagination?.total_pages || Math.ceil(this.newLeadsTotalItems / this.newLeadsItemsPerPage);
          
          console.log(' Final new leads count:', contactsWithSortedComments.length);
        } else {
          console.log(' No data received from API');
          this.newLeadsDataSource = new MatTableDataSource<any>([]);
          this.newLeadsTotalItems = 0;
          this.newLeadsTotalPages = 1;
        }
      },
      (error) => {
        console.error(' Error fetching new leads:', error);
      }
    );
  }
  
  
  loadRegisteredLeads() {
    const params: any = {
      page_size: this.registeredItemsPerPage, 
      page_num: this.registeredPageNum,
      assignee: this.userName
    };
  
    if (this.userType === 'staff') {
    params.assignee = this.userName;
  }
  
    this.contactService.getRegisteredUsers(params).subscribe(
      (data: any) => {
        if (data && data.data && data.data.length > 0) {
          const registeredLeads = data.data.map((contact: any) => {
            return { 
              ...contact, 
              registered_date: contact.updatedAt || contact.createdAt 
            };
          });
          
          this.registeredDataSource = new MatTableDataSource(registeredLeads);
          this.registeredTotalItems = data.pagination?.total_items || registeredLeads.length;
          this.registeredTotalPages = data.pagination?.total_pages || Math.ceil(this.registeredTotalItems / this.registeredItemsPerPage);
        } else {
          this.registeredDataSource = new MatTableDataSource<any>([]);
          this.registeredTotalItems = 0;
          this.registeredTotalPages = 1;
        }
      },
      (error) => {
        console.error('Error fetching registered leads:', error);
      }
    );
  }
  
  // Add selection methods for registered table
  isAllRegisteredSelected() {
    const numSelected = this.registeredSelection.selected.length;
    const numRows = this.registeredDataSource.data.length;
    return numSelected === numRows;
  }
  
  registeredMasterToggle() {
    this.isAllRegisteredSelected() ?
      this.registeredSelection.clear() :
      this.registeredDataSource.data.forEach(row => this.registeredSelection.select(row));
  }
  // New Leads pagination methods
  getNewLeadsPageNumbers(): number[] {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.newLeadsPageNum - 2);
    let endPage = Math.min(this.newLeadsTotalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1 && startPage > 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    return Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i);
  }
  
  getNewLeadsStartItem(): number {
    return (this.newLeadsPageNum - 1) * this.newLeadsItemsPerPage + 1;
  }
  
  getNewLeadsEndItem(): number {
    return Math.min(this.newLeadsPageNum * this.newLeadsItemsPerPage, this.newLeadsTotalItems);
  }
  
  goToNewLeadsPage(page: number): void {
    if (page >= 1 && page <= this.newLeadsTotalPages && page !== this.newLeadsPageNum) {
      this.newLeadsPageNum = page;
      this.loadNewLeads(); // You'll need to create this method
    }
  }
  
  goToNewLeadsFirstPage(): void {
    if (this.newLeadsPageNum > 1) {
      this.goToNewLeadsPage(1);
    }
  }
  
  goToNewLeadsPreviousPage(): void {
    if (this.newLeadsPageNum > 1) {
      this.goToNewLeadsPage(this.newLeadsPageNum - 1);
    }
  }
  
  goToNewLeadsNextPage(): void {
    if (this.newLeadsPageNum < this.newLeadsTotalPages) {
      this.goToNewLeadsPage(this.newLeadsPageNum + 1);
    }
  }
  
  goToNewLeadsLastPage(): void {
    if (this.newLeadsPageNum < this.newLeadsTotalPages) {
      this.goToNewLeadsPage(this.newLeadsTotalPages);
    }
  }
  
  getFollowupPageNumbers(): number[] {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.followupPageNum - 2);
    let endPage = Math.min(this.followupTotalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1 && startPage > 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    return Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i);
  }
  
  getFollowupStartItem(): number {
    return (this.followupPageNum - 1) * this.followupItemsPerPage + 1;
  }
  
  getFollowupEndItem(): number {
    return Math.min(this.followupPageNum * this.followupItemsPerPage, this.followupTotalItems);
  }
  
  goToFollowupPage(page: number): void {
    if (page >= 1 && page <= this.followupTotalPages && page !== this.followupPageNum) {
      this.followupPageNum = page;
      this.loadTodaysFollowups(); // You'll need to create this method
    }
  }
  
  goToFollowupFirstPage(): void {
    if (this.followupPageNum > 1) {
      this.goToFollowupPage(1);
    }
  }
  
  goToFollowupPreviousPage(): void {
    if (this.followupPageNum > 1) {
      this.goToFollowupPage(this.followupPageNum - 1);
    }
  }
  
  goToFollowupNextPage(): void {
    if (this.followupPageNum < this.followupTotalPages) {
      this.goToFollowupPage(this.followupPageNum + 1);
    }
  }
  
  goToFollowupLastPage(): void {
    if (this.followupPageNum < this.followupTotalPages) {
      this.goToFollowupPage(this.followupTotalPages);
    }
  }
  
  // Registered Leads pagination methods
  getRegisteredPageNumbers(): number[] {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.registeredPageNum - 2);
    let endPage = Math.min(this.registeredTotalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1 && startPage > 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    return Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i);
  }
  
  getRegisteredStartItem(): number {
    return (this.registeredPageNum - 1) * this.registeredItemsPerPage + 1;
  }
  
  getRegisteredEndItem(): number {
    return Math.min(this.registeredPageNum * this.registeredItemsPerPage, this.registeredTotalItems);
  }
  
  goToRegisteredPage(page: number): void {
    if (page >= 1 && page <= this.registeredTotalPages && page !== this.registeredPageNum) {
      this.registeredPageNum = page;
      this.loadRegisteredLeads(); // You'll need to create this method
    }
  }
  
  goToRegisteredFirstPage(): void {
    if (this.registeredPageNum > 1) {
      this.goToRegisteredPage(1);
    }
  }
  
  goToRegisteredPreviousPage(): void {
    if (this.registeredPageNum > 1) {
      this.goToRegisteredPage(this.registeredPageNum - 1);
    }
  }
  
  goToRegisteredNextPage(): void {
    if (this.registeredPageNum < this.registeredTotalPages) {
      this.goToRegisteredPage(this.registeredPageNum + 1);
    }
  }
  
  goToRegisteredLastPage(): void {
    if (this.registeredPageNum < this.registeredTotalPages) {
      this.goToRegisteredPage(this.registeredTotalPages);
    }
  }
  
  loadFollowupLeads() {
    const params: any = {
      searchTerm: this.searchTerm,
      start_date: this.formatDate(this.startDate),
      end_date: this.formatDate(this.endDate),
      page_size: this.followupLeadsItemsPerPage,
      page_num: this.followupLeadsPageNum,
      // assignee: this.userName,
    };
  
    if (this.userType === 'staff') {
      params.assignee = this.userName;
    }
  
    this.contactServices.getFollowupLeads(params).subscribe(
      (data: any) => {
        console.log(' Followup leads data:', data);
        
        if (data && data.data && data.data.length > 0) {
          const contactsWithSortedComments = data.data.map((contact: any) => {
            if (contact.comments && contact.comments.length > 0) {
              contact.comments.sort((a: any, b: any) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            }
            return { ...contact, itemId: contact.id };
          });
          
          this.followupLeadsDataSource = new MatTableDataSource(contactsWithSortedComments);
          this.followupLeadsTotalItems = data.pagination?.total_items || data.data.length;
          this.followupLeadsTotalPages = data.pagination?.total_pages || Math.ceil(this.followupLeadsTotalItems / this.followupLeadsItemsPerPage);
        } else {
          this.followupLeadsDataSource = new MatTableDataSource<any>([]);
          this.followupLeadsTotalItems = 0;
          this.followupLeadsTotalPages = 1;
        }
      },
      (error) => {
        console.error('Error fetching followup leads:', error);
      }
    );
  }
  
  // Selection methods for followup leads
  isAllFollowupLeadsSelected() {
    const numSelected = this.followupLeadsSelection.selected.length;
    const numRows = this.followupLeadsDataSource.data.length;
    return numSelected === numRows;
  }
  
  followupLeadsMasterToggle() {
    this.isAllFollowupLeadsSelected() ?
      this.followupLeadsSelection.clear() :
      this.followupLeadsDataSource.data.forEach(row => this.followupLeadsSelection.select(row));
  }
  
  // Pagination methods for followup leads
  getFollowupLeadsPageNumbers(): number[] {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.followupLeadsPageNum - 2);
    let endPage = Math.min(this.followupLeadsTotalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1 && startPage > 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    return Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i);
  }
  
  getFollowupLeadsStartItem(): number {
    return (this.followupLeadsPageNum - 1) * this.followupLeadsItemsPerPage + 1;
  }
  
  getFollowupLeadsEndItem(): number {
    return Math.min(this.followupLeadsPageNum * this.followupLeadsItemsPerPage, this.followupLeadsTotalItems);
  }
  
  goToFollowupLeadsPage(page: number): void {
    if (page >= 1 && page <= this.followupLeadsTotalPages && page !== this.followupLeadsPageNum) {
      this.followupLeadsPageNum = page;
      this.loadFollowupLeads();
    }
  }
  
  goToFollowupLeadsFirstPage(): void {
    if (this.followupLeadsPageNum > 1) {
      this.goToFollowupLeadsPage(1);
    }
  }
  
  goToFollowupLeadsPreviousPage(): void {
    if (this.followupLeadsPageNum > 1) {
      this.goToFollowupLeadsPage(this.followupLeadsPageNum - 1);
    }
  }
  
  goToFollowupLeadsNextPage(): void {
    if (this.followupLeadsPageNum < this.followupLeadsTotalPages) {
      this.goToFollowupLeadsPage(this.followupLeadsPageNum + 1);
    }
  }
  
  goToFollowupLeadsLastPage(): void {
    if (this.followupLeadsPageNum < this.followupLeadsTotalPages) {
      this.goToFollowupLeadsPage(this.followupLeadsTotalPages);
    }
  }
  
   sortLeadsByStatusPriority(contacts?: any[]): any[] | void {
    interface StatusPriority {
      [key: string]: number;
      'Positive': number;
      'Medium': number;
      'New lead': number;
      'Contacted': number;
      'Followup': number;
      'Not interested': number;
      'Finalized': number;
    }
  
    const statusPriority: StatusPriority = {
      'Positive': 1,      
      'Medium': 2,        
      'New lead': 3,
      'Contacted': 4, 
      'Followup': 5,   
      'Not interested': 6,
      'Finalized': 7      
    };
  
    const sortFunction = (a: any, b: any) => {
      const priorityA = statusPriority[a.lead_status as keyof StatusPriority] || 99;
      const priorityB = statusPriority[b.lead_status as keyof StatusPriority] || 99;
      return priorityA - priorityB;
    };
  
      if (contacts) {
      return [...contacts].sort(sortFunction);
    }
     this.dataSource.data.sort(sortFunction);
    this.dataSource._updateChangeSubscription();
  }
  
  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }
  loadTodaysFollowups() {
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));
  
    // Get ALL non-registered contacts for this staff member
    const params: any = {
      page_size: 1000,
      page_num: 1,
      // assignee: this.userName,
      exclude_registered: true,
    };
  if (this.userType === 'staff') {
    params.assignee = this.userName;
  }
    this.contactServices.getNonRegisteredContacts(params).subscribe(
      (data: any) => {
        if (data && data.data && data.data.length > 0) {
          console.log('🔍 [DEBUG] All contacts loaded:', data.data.length);
          
          // Filter contacts for Today's Followup table
          const filteredContacts = data.data.filter((contact: any) => {
            // For Positive and Medium status, check if they have a followup date set for today
            const isPositiveOrMedium = contact.lead_status === 'Positive' || contact.lead_status === 'Medium';
            const isFollowup = contact.lead_status === 'Followup';
            
            let hasTodayFollowup = false;
            
            // Check if contact has a followup date set
            if (contact.followup_date) {
              const followupDate = new Date(contact.followup_date);
              hasTodayFollowup = this.isToday(followupDate);
            }
            
            
            return (isFollowup && hasTodayFollowup) || (isPositiveOrMedium && hasTodayFollowup);
          });
  
          console.log('🔍 [DEBUG] Filtered Today\'s Followup contacts:', {
            total: filteredContacts.length,
            positive: filteredContacts.filter((c: any) => c.lead_status === 'Positive').length,
            medium: filteredContacts.filter((c: any) => c.lead_status === 'Medium').length,
            followup: filteredContacts.filter((c: any) => c.lead_status === 'Followup').length
          });
  
          // Use your existing sorting method
          const sortedContacts = this.sortLeadsByStatusPriority(filteredContacts) as any[];
  
          console.log('After sorting - Today\'s Followup table:', {
            total: sortedContacts.length,
            order: sortedContacts.map((c: any) => ({ name: c.fullname, status: c.lead_status, followup_date: c.followup_date }))
          });
          
          const contactsWithSortedComments = sortedContacts.map((contact: any) => {
            if (contact.comments && contact.comments.length > 0) {
              contact.comments.sort((a: any, b: any) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            }
            return { ...contact, itemId: contact.id };
          });
          
          this.followupDataSource = new MatTableDataSource(contactsWithSortedComments);
          this.followupTotalItems = contactsWithSortedComments.length;
          this.followupTotalPages = Math.ceil(this.followupTotalItems / this.followupItemsPerPage);
          
        } else {
          this.followupDataSource = new MatTableDataSource<any>([]);
          this.followupTotalItems = 0;
          this.followupTotalPages = 1;
        }
      },
      (error) => {
        console.error('Error fetching contacts for today\'s followups:', error);
      }
    );
  }
  loadFinalizedLeads() {
    const params: any = {
      searchTerm: this.searchTerm,
      start_date: this.formatDate(this.startDate),
      end_date: this.formatDate(this.endDate),
      page_size: this.finalizedItemsPerPage,
      page_num: this.finalizedPageNum,
      // assignee: this.userName,
    };
  
    if (this.userType === 'staff') {
      params.assignee = this.userName;
    }
  
    this.contactServices.getFinalizedLeads(params).subscribe(
      (data: any) => {
        console.log('🔍 [DEBUG] Finalized leads data:', data);
        
        if (data && data.data && data.data.length > 0) {
          const contactsWithSortedComments = data.data.map((contact: any) => {
            if (contact.comments && contact.comments.length > 0) {
              contact.comments.sort((a: any, b: any) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            }
            return { ...contact, itemId: contact.id };
          });
          
          this.finalizedDataSource = new MatTableDataSource(contactsWithSortedComments);
          this.finalizedTotalItems = data.pagination?.total_items || data.data.length;
          this.finalizedTotalPages = data.pagination?.total_pages || Math.ceil(this.finalizedTotalItems / this.finalizedItemsPerPage);
        } else {
          this.finalizedDataSource = new MatTableDataSource<any>([]);
          this.finalizedTotalItems = 0;
          this.finalizedTotalPages = 1;
        }
      },
      (error) => {
        console.error('Error fetching finalized leads:', error);
      }
    );
  }
  
  // Selection methods for finalized table
  isAllFinalizedSelected() {
    const numSelected = this.finalizedSelection.selected.length;
    const numRows = this.finalizedDataSource.data.length;
    return numSelected === numRows;
  }
  
  finalizedMasterToggle() {
    this.isAllFinalizedSelected() ?
      this.finalizedSelection.clear() :
      this.finalizedDataSource.data.forEach(row => this.finalizedSelection.select(row));
  }
  
  // Pagination methods for finalized table
  getFinalizedPageNumbers(): number[] {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.finalizedPageNum - 2);
    let endPage = Math.min(this.finalizedTotalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1 && startPage > 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    return Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i);
  }
  
  getFinalizedStartItem(): number {
    return (this.finalizedPageNum - 1) * this.finalizedItemsPerPage + 1;
  }
  
  getFinalizedEndItem(): number {
    return Math.min(this.finalizedPageNum * this.finalizedItemsPerPage, this.finalizedTotalItems);
  }
  
  goToFinalizedPage(page: number): void {
    if (page >= 1 && page <= this.finalizedTotalPages && page !== this.finalizedPageNum) {
      this.finalizedPageNum = page;
      this.loadFinalizedLeads();
    }
  }
  
  goToFinalizedFirstPage(): void {
    if (this.finalizedPageNum > 1) {
      this.goToFinalizedPage(1);
    }
  }
  
  goToFinalizedPreviousPage(): void {
    if (this.finalizedPageNum > 1) {
      this.goToFinalizedPage(this.finalizedPageNum - 1);
    }
  }
  
  goToFinalizedNextPage(): void {
    if (this.finalizedPageNum < this.finalizedTotalPages) {
      this.goToFinalizedPage(this.finalizedPageNum + 1);
    }
  }
  
  goToFinalizedLastPage(): void {
    if (this.finalizedPageNum < this.finalizedTotalPages) {
      this.goToFinalizedPage(this.finalizedTotalPages);
    }
  }
  
  
  openCreateRegistrationDialog(user: any): void {
      const dialogRef = this.dialog.open(CreateRegisteredDialogComponent, {
        width: '600px',
        data: { user } // Pass the user data to the dialog
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadRegisteredLeads(); // Refresh the list if a new registration was created
        }
      });
    }
loadAccounts(): void {
  console.log('🔄 [DEBUG] loadAccounts() called');
  
  const params: any = {
    page_size: this.accountsItemsPerPage,
    page_num: this.accountsPageNum,
    assignee: this.userName,
  };

  if (this.userType === 'staff') {
    params.assignee = this.userName;
  }

  console.log('📋 [DEBUG] Accounts API params:', params);

  this.accountService.getAllAccounts(params).subscribe(
    (data: any) => {
      console.log('✅ [DEBUG] Accounts API response:', data);
      
      if (data && data.data) {
        console.log('📊 [DEBUG] Accounts data received:', data.data.length, 'items');
        
        // Debug each account's email
        data.data.forEach((account: any, index: number) => {
          console.log(`📧 [DEBUG] Account ${index + 1}:`, {
            name: account.contactDetails?.name,
            directEmail: account.email,
            nestedEmail: account.contactDetails?.email,
            hasEmail: !!account.email,
            hasContactDetailsEmail: !!account.contactDetails?.email
          });
        });
        
        this.accountsDataSource = new MatTableDataSource(data.data);
        this.accountsTotalItems = data.pagination?.total_items || data.data.length;
        this.accountsTotalPages = data.pagination?.total_pages || Math.ceil(this.accountsTotalItems / this.accountsItemsPerPage);
        
        console.log('🎯 [DEBUG] Accounts data source updated:', this.accountsDataSource.data);
      } else {
        console.log('❌ [DEBUG] No accounts data received');
        this.accountsDataSource = new MatTableDataSource<any>([]);
        this.accountsTotalItems = 0;
        this.accountsTotalPages = 1;
      }
    },
    (error) => {
      console.error('❌ [DEBUG] Error fetching accounts:', error);
    }
  );
}
  
  // Add selection methods for accounts table
  isAllAccountsSelected() {
    const numSelected = this.accountsSelection.selected.length;
    const numRows = this.accountsDataSource.data.length;
    return numSelected === numRows;
  }
  
  accountsMasterToggle() {
    this.isAllAccountsSelected() ?
      this.accountsSelection.clear() :
      this.accountsDataSource.data.forEach(row => this.accountsSelection.select(row));
  }
  
  // Accounts pagination methods
  getAccountsPageNumbers(): number[] {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.accountsPageNum - 2);
    let endPage = Math.min(this.accountsTotalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1 && startPage > 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    return Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i);
  }
  
  getAccountsStartItem(): number {
    return (this.accountsPageNum - 1) * this.accountsItemsPerPage + 1;
  }
  
  getAccountsEndItem(): number {
    return Math.min(this.accountsPageNum * this.accountsItemsPerPage, this.accountsTotalItems);
  }
  
  goToAccountsPage(page: number): void {
    if (page >= 1 && page <= this.accountsTotalPages && page !== this.accountsPageNum) {
      this.accountsPageNum = page;
      this.loadAccounts();
    }
  }
  
  goToAccountsFirstPage(): void {
    if (this.accountsPageNum > 1) {
      this.goToAccountsPage(1);
    }
  }
  
  goToAccountsPreviousPage(): void {
    if (this.accountsPageNum > 1) {
      this.goToAccountsPage(this.accountsPageNum - 1);
    }
  }
  
  goToAccountsNextPage(): void {
    if (this.accountsPageNum < this.accountsTotalPages) {
      this.goToAccountsPage(this.accountsPageNum + 1);
    }
  }
  
  goToAccountsLastPage(): void {
    if (this.accountsPageNum < this.accountsTotalPages) {
      this.goToAccountsPage(this.accountsTotalPages);
    }
  }
  
  // Add view account modal method
  viewAccountModal(contactId: string): void {
    if (contactId) {
      const dialogRef = this.dialog.open(AccountDialogComponent, {
        width: '90%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        data: { contactId: contactId }
      });
    }
  }
  
  manageInstallments(account: any): void {
    const dialogRef = this.dialog.open(InstallmentManagementDialogComponent, {
      width: '1200px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { account: account }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.loadAccounts(); // Refresh accounts data
        this.openSnackBar('Installments updated successfully');
      }
    });
  }
  
  loadDashboardData(): void {
   this.userService.getDashboardData().subscribe({
    next: (res) => {
      console.log('Dashboard data received:', res); // Debug log
      
      // Process followup leads
      this.followupLeads = (res.data.followupLeads || []).map(lead => ({
        ...lead,
        createdDate: lead.createdAt,
        createdTime: lead.createdAt,
        courses: Array.isArray(lead.courses) ? lead.courses : [lead.courses]
      }));
      
      // Process new enrollments
      this.newEnrollments = (res.data.newEnrollments || []).map(enrollment => ({
        ...enrollment,
        createdDate: enrollment.createdAt,
        createdTime: enrollment.createdAt,
        courses: Array.isArray(enrollment.courses) ? enrollment.courses : [enrollment.courses]
      }));
      
      console.log('New enrollments count:', this.newEnrollments.length); // Debug log
      
      // Initialize data sources

      
      
      if (res.data.trainingStats) {
        this.trainingStats = res.data.trainingStats;
        console.log('Training stats:', this.trainingStats); // Debug log
      }
    },
    error: (err) => {
      console.error('Error loading dashboard data:', err);
      this.openSnackBar('Error loading dashboard data');
    }
  });
}

hasOverdueInstallments(account: any): boolean {
  if (account.overallStatus === 'overdue') {
    return true;
  }
   if (account.installments && Array.isArray(account.installments)) {
    const today = new Date();
    return account.installments.some((installment: any) => {
      if (installment.status === 'paid') return false;
      
      const dueDate = new Date(installment.dueDate);
      return dueDate < today && installment.status !== 'paid';
    });
  }
   return account.hasOverdueInstallments === true || 
         (account.overdueInstallmentsCount > 0) ||
         (account.pendingAmount > 0 && account.overallStatus === 'overdue');
}
getAccountRowClass(account: any): string {
  if (this.hasOverdueInstallments(account)) {
    return 'overdue-account-row';
  }
  return '';
}

}
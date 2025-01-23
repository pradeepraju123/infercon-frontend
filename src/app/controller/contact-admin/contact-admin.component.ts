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
  published: any;
  sortBy: any
  pageSize = 10;
  pageNum = 1;
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
    private authService: AuthService) {}
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
      this.displayedColumns = ['select', 'fullname', 'phone', 'course', 'createdDate','createdTime', 'leadSelection','Action', 'SendMessage'];
    } else if(this.userType === 'admin') {
      this.displayedColumns = ['select', 'fullname', 'phone', 'course', 'createdDate','createdTime','assigneeSelection','Action', 'SendMessage'];
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
  onCourseSelectionChange(selectedLead: string, itemId: string) {
    this.contactId = itemId;
  
    if (this.contactId) {
      console.log(this.contactId);
      // Create an object with the lead_status property
      const updateData = { lead_status: selectedLead };
  
      // Call the updateContact method with the contactId and updateData
      this.contactServices.updateContact(this.contactId, updateData)
        .subscribe(
          response => {
            console.log('Contact updated successfully:', response);
          },
          error => {
            console.error('Error updating contact:', error);
          }
        );
        }
  
    // Find the index of the current row in the dataSource array
    const rowIndex = this.dataSource.data.findIndex(item => item.itemId === itemId);
  
    // Update the selected course for the current row
    this.dataSource.data[rowIndex].lead_status = selectedLead;
  
    // You can perform additional actions based on the selected course
    console.log('Selected LeadStatus:', selectedLead);
  }
  onAssigneeSelect(selectedAssignee: string, itemId: string){
    this.contactId = itemId;
  
    if (this.contactId) {
      console.log(this.contactId);
      // Create an object with the lead_status property
      const updateData = { assignee: selectedAssignee };
  
      // Call the updateContact method with the contactId and updateData
      this.contactServices.updateContact(this.contactId, updateData)
        .subscribe(
          response => {
            console.log('Contact updated successfully:', response);
          },
          error => {
            console.error('Error updating contact:', error);
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
    this.loadContacts();
    this.getUser();
    this.getUserType();
    this.getUserName()
  }
  loadContacts() {
    const params = {
      searchTerm: this.searchTerm,
      start_date: this.formatDate(this.startDate),
      end_date: this.formatDate(this.endDate),
      published: this.published,
      sort_by: this.sortBy,
      page_size: this.pageSize,
      page_num: this.pageNum,
      assignee: this.getUserName()
    };
    this.contactServices.getAllContact(params).subscribe(
      (data: any) => {
        if (data && data.data && data.data.length > 0) {
          // Assuming your contact data has an 'id' property
          
          this.dataSource = new MatTableDataSource(data.data.map((item: any) => ({ ...item, itemId: item.id })));
          // Change SelectionModel to match the type of your data source
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        } else {
          console.log('No more data available.');
        }
      },
      (error) => {
        console.error('Error fetching contact data:', error);
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
      // Get the selected_ids asynchronously
      this.selected_ids = await this.getSelectedIds();
  
      console.log(this.selected_ids);
  
      if (this.selected_ids && this.selected_ids.length > 0) {
        const updateData = { assignee: this.selectedAssignee };
  
        // Call the updateContact method with the contactId and updateData
        this.contactServices.updateContactBulk(this.selected_ids, updateData)
          .subscribe(
            response => {
              console.log('Contact updated successfully:', response);
              this.contactServices.sendNotification(this.selected_ids, this.selectedAssignee).subscribe(
                response => {
                  console.log('Send Notification successfully:', response);
                },
                error => {
                  console.error('Error while send notification:', error);
                });
              this.loadContacts()
            },
            error => {
              console.error('Error updating contact:', error);
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
}

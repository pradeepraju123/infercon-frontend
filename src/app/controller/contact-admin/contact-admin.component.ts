import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ContactService } from '../../services/contact.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {LiveAnnouncer} from '@angular/cdk/a11y';

import { MatSort, Sort } from '@angular/material/sort';
import {
  MatDialog,
} from '@angular/material/dialog';
import { EditContactComponent } from '../../components/edit-contact/edit-contact.component';

@Component({
  selector: 'app-contact-admin',
  templateUrl: './contact-admin.component.html',
  styleUrl: './contact-admin.component.css'
})
export class ContactAdminComponent implements AfterViewInit {
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['fullname', 'phone', 'course', 'createdAt', 'leadSelection','assigneeSelection','Action'];
  leadOptions: string[] = ['New lead', 'Contacted', 'Followup', 'Not interested', 'Finalized'];
  assigneeOptions: string[] = ['Pradeep raju', 'senthil', 'Srinivasan', 'sulochana', 'raja'];
  contactId!: string
  filteredTrainings: any[] = []; // Add a property to store filtered data
  searchTerm: string = '';
  startDate: any;
  endDate: any;
  published: any;
  sortBy: any
  pageSize: number = 10;
  pageNum: number = 1;
  data : any
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private contactServices: ContactService, private _liveAnnouncer: LiveAnnouncer, public dialog: MatDialog) {}
  
  openDialog(_id: String) {
    this.dialog.open(EditContactComponent, {
      data: {
        itemId: _id,
      }
    });
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
  }
  loadContacts() {
    const params = {
      // Add any query parameters here
    };
  
    this.contactServices.getAllContact(params).subscribe(
      (data: any) => {
        // Assuming your contact data has an 'id' property
        this.dataSource = new MatTableDataSource(data.data.map((item: any) => ({ ...item, itemId: item.id })));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (error) => {
        console.error('Error fetching contact data:', error);
      }
    );
  }
  search(): void {
    const param = {
      searchTerm: this.searchTerm,
      start_date: this.formatDate(this.startDate),
      end_date: this.formatDate(this.endDate),
      published: this.published,
      sort_by: this.sortBy,
      page_size: this.pageSize,
      page_num: this.pageNum
    };
  
    this.contactServices.getAllContact(param).subscribe(
      (responseData: any) => {
        this.filteredTrainings = responseData.data; // Assuming 'data' is the property containing the results
      },
      error => {
        console.error('Error:', error);
        // Handle error if needed
      }
    );
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
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../services/user.service';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { EditContactComponent } from '../../components/edit-contact/edit-contact.component';
import { CommentsDialogComponent } from '../../components/comments-dialog/comments-dialog.component';
import { ContactService } from '../../services/contact.service';
import { AuthService } from '../../services/auth.service';
import { FollowupDialogComponent } from '../../components/followup-dialog/followup-dialog.component';
import { 
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition 
} from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

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
export class DashboardComponent implements OnInit {
  followupLeads: any[] = [];
  newEnrollments: any[] = [];
  chart: any;
  trainingStats: TrainingStats = {
    totalLeads: 0,
    registeredLeads: 0,
    paidLeads: 0,
    rejectedLeads: 0,
  };
  
  followupDataSource = new MatTableDataSource<any>();
  newEnrollmentDataSource = new MatTableDataSource<any>();
  
  followupSelection = new SelectionModel<any>(true, []);
  enrollmentSelection = new SelectionModel<any>(true, []);
  
  leadOptions: string[] = ['New lead', 'Contacted', 'Followup', 'Not interested', 'Finalized'];
  userType!:string; 
  userName!: string;
  contactId!: string;

followupPageSize = 10;
  followupCurrentPage = 1;
  followupTotalItems = 0;
  followupTotalPages = 1;
  
  newEnrollmentPageSize = 10;
  newEnrollmentCurrentPage = 1;
  newEnrollmentTotalItems = 0;
  newEnrollmentTotalPages = 1;

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService, 
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private contactService: ContactService,
    private authService: AuthService
  ) {}

 ngOnInit(): void {
    this.userType = this.getUserType();
    this.userName = this.getUserName();
    this.loadDashboardData();
  }

  getUserType(): string {
    const token = sessionStorage.getItem('authToken');
    return this.authService.getUserTypeFromToken(token) || '';
  }

  getUserName(): string {
    const token = sessionStorage.getItem('authToken');
    return this.authService.getUserNameFromToken(token) || '';
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
      this.followupDataSource = new MatTableDataSource<any>(this.followupLeads);
      this.newEnrollmentDataSource = new MatTableDataSource<any>(this.newEnrollments);

      this.followupDataSource.sort = this.sort;
      this.newEnrollmentDataSource.sort = this.sort;
      
      // Set up pagination
      this.followupTotalItems = res.data.followupPagination?.total || this.followupLeads.length;
      this.newEnrollmentTotalItems = res.data.newEnrollmentPagination?.total || this.newEnrollments.length;
      
      this.updateFollowupPagination();
      this.updateEnrollmentPagination();
      
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


  getFollowupDisplayedColumns(): string[] {
    const baseColumns = [
      'select',
      'fullname',
      'phone',
      'course',
      'followupDate',
      'followupTime',
      'leadSelection',
      'comments',
      'MarkRegistered'
    ];

    if (this.userType === 'admin') {
      return [...baseColumns, 'Action', 'SendMessage'];
    }
    return baseColumns;
  }

  getNewEnrollmentDisplayedColumns(): string[] {
    const baseColumns = [
      'select',
      'fullname',
      'phone',
      'course',
      'createdDate',
      'createdTime',
      'leadSelection',
      'comments',
      'MarkRegistered'
    ];

    if (this.newEnrollmentDataSource.data.some(item => item.followup_date)) {
      baseColumns.splice(7, 0, 'followupDate');
      baseColumns.splice(8, 0, 'followupTime');
    }

    if (this.userType === 'admin') {
      return [...baseColumns, 'Action', 'SendMessage'];
    }
    return baseColumns;
  }

  isAllSelected(table: string): boolean {
    const numSelected = table === 'followup' 
      ? this.followupSelection.selected.length 
      : this.enrollmentSelection.selected.length;
    const numRows = table === 'followup' 
      ? this.followupDataSource.data.length 
      : this.newEnrollmentDataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle(table: string): void {
    if (table === 'followup') {
      this.isAllSelected('followup') ?
        this.followupSelection.clear() :
        this.followupDataSource.data.forEach(row => this.followupSelection.select(row));
    } else {
      this.isAllSelected('enrollment') ?
        this.enrollmentSelection.clear() :
        this.newEnrollmentDataSource.data.forEach(row => this.enrollmentSelection.select(row));
    }
  }

  getLeadStatusClass(status: string): string {
    if (!status) return '';
    return `mat-select-${status.toLowerCase().replace(/\s+/g, '-')}`;
  }

  async onLeadStatusChange(selectedLead: string, itemId: string, isFollowup: boolean): Promise<void> {
    const dataSource = isFollowup ? this.followupDataSource : this.newEnrollmentDataSource;
    
    if (itemId) {
      const updateData: any = { lead_status: selectedLead };

      if (selectedLead === 'Followup') {
        const dialogRef = this.dialog.open(FollowupDialogComponent, {
          width: '400px'
        });

        const result = await dialogRef.afterClosed().toPromise();
        
        if (!result) return;

        updateData.followup_date = result.followupDate;
        updateData.followup_time = result.followupTime;
        
        if (updateData.followup_time) {
          const timeParts = updateData.followup_time.split(':');
          if (timeParts.length === 2) {
            updateData.followup_time = `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
          }
        }
      }

      this.contactService.updateContact(itemId, updateData).subscribe(
        response => {
          const rowIndex = dataSource.data.findIndex(item => item._id === itemId);
          if (rowIndex !== -1) {
            dataSource.data[rowIndex] = { ...dataSource.data[rowIndex], ...updateData };
            dataSource._updateChangeSubscription();
            this.loadDashboardData();
          }
          this.openSnackBar('Lead status updated successfully');
        },
        error => {
          console.error('Error updating contact:', error);
          this.openSnackBar('Error updating lead status');
        }
      );
    }
  }

  markAsRegistered(contactId: string, isFollowup: boolean): void {
    const dataSource = isFollowup ? this.followupDataSource : this.newEnrollmentDataSource;
    const contact = dataSource.data.find(item => item._id === contactId);
    
    if (!contact) {
      this.openSnackBar('Contact not found');
      return;
    }
    
    if (contact.lead_status !== 'Finalized') {
      this.openSnackBar('Only Finalized leads can be marked as registered');
      return;
    }
    
    this.contactService.markAsRegistered(contactId).subscribe(
      (response) => {
        const index = dataSource.data.findIndex(item => item._id === contactId);
        if (index !== -1) {
          dataSource.data[index].isRegistered = 1;
          dataSource._updateChangeSubscription();
          this.openSnackBar('Lead marked as registered successfully');
          setTimeout(() => {
            this.router.navigate(['/user-register'], {
              state: { registeredContact: dataSource.data[index] }
            });
          }, 500);
        }
      },
      (error) => {
        console.error('Error marking lead as registered:', error);
        this.openSnackBar('Error marking lead as registered');
      }
    );
  }

  openCommentsDialog(contactId: string, contactName: string): void {
    this.dialog.open(CommentsDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      data: {
        contactId: contactId,
        contactName: contactName
      },
      panelClass: 'comments-dialog-panel'
    }).afterClosed().subscribe(() => {
      this.loadDashboardData();
    });
  }

  sendLeadDetails(contactId: string): void {
    if (contactId) {
      this.contactService.sendLeadDetailsToStaff([contactId]).subscribe(
        response => {
          this.openSnackBar('Lead details sent successfully');
        },
        error => {
          console.error('Error sending lead details:', error);
          this.openSnackBar('Error sending lead details');
        }
      );
    }
  }

  getPageNumbers(table: string): number[] {
    const currentPage = table === 'followup' ? this.followupCurrentPage : this.newEnrollmentCurrentPage;
    const totalPages = table === 'followup' ? this.followupTotalPages : this.newEnrollmentTotalPages;
    
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1 && startPage > 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    return Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i);
  }

  getStartItem(table: string): number {
    const currentPage = table === 'followup' ? this.followupCurrentPage : this.newEnrollmentCurrentPage;
    const pageSize = table === 'followup' ? this.followupPageSize : this.newEnrollmentPageSize;
    return (currentPage - 1) * pageSize + 1;
  }

  getEndItem(table: string): number {
    const currentPage = table === 'followup' ? this.followupCurrentPage : this.newEnrollmentCurrentPage;
    const pageSize = table === 'followup' ? this.followupPageSize : this.newEnrollmentPageSize;
    const totalItems = table === 'followup' ? this.followupTotalItems : this.newEnrollmentTotalItems;
    return Math.min(currentPage * pageSize, totalItems);
  }

  goToPage(page: number, table: string): void {
    if (table === 'followup') {
      if (page >= 1 && page <= this.followupTotalPages && page !== this.followupCurrentPage) {
        this.followupCurrentPage = page;
        this.updateFollowupPagination();
        this.loadDashboardData();
      }
    } else {
      if (page >= 1 && page <= this.newEnrollmentTotalPages && page !== this.newEnrollmentCurrentPage) {
        this.newEnrollmentCurrentPage = page;
        this.updateEnrollmentPagination();
        this.loadDashboardData();
      }
    }
  }

goToNextPage(table: string): void { this.goToPage((table === 'followup' ? this.followupCurrentPage : this.newEnrollmentCurrentPage) + 1, table); }
goToPreviousPage(table: string): void { this.goToPage((table === 'followup' ? this.followupCurrentPage : this.newEnrollmentCurrentPage) - 1, table); }
goToFirstPage(table: string): void { this.goToPage(1, table); }
goToLastPage(table: string): void { this.goToPage((table === 'followup' ? this.followupTotalPages : this.newEnrollmentTotalPages), table); }

  updateFollowupPagination(): void {
  const startIndex = (this.followupCurrentPage - 1) * this.followupPageSize;
  const endIndex = startIndex + this.followupPageSize;
  this.followupDataSource.data = this.followupLeads.slice(startIndex, endIndex);
  this.followupTotalItems = this.followupLeads.length;
  this.followupTotalPages = Math.ceil(this.followupTotalItems / this.followupPageSize);
}

updateEnrollmentPagination(): void {
  const startIndex = (this.newEnrollmentCurrentPage - 1) * this.newEnrollmentPageSize;
  const endIndex = startIndex + this.newEnrollmentPageSize;
  this.newEnrollmentDataSource.data = this.newEnrollments.slice(startIndex, endIndex);
  this.newEnrollmentTotalItems = this.newEnrollments.length;
  this.newEnrollmentTotalPages = Math.ceil(this.newEnrollmentTotalItems / this.newEnrollmentPageSize);
}

// ngAfterViewInit() {
//   this.buildChart();
// }

// buildChart() {
//   // Wait for the canvas to be available
//   setTimeout(() => {
//     const canvas = document.getElementById('canvas') as HTMLCanvasElement;
//     if (!canvas) {
//       console.error('Canvas element not found');
//       return;
//     }

//     // Destroy previous chart if it exists
//     if (this.chart) {
//       this.chart.destroy();
//     }

//     const ctx = canvas.getContext('2d');
//     if (!ctx) {
//       console.error('Could not get canvas context');
//       return;
//     }

//     // Prepare data for the chart
//     const labels = ['Followups', 'New Enrollments', 'Registered', 'Rejected'];
//     const dataCounts = [
//       this.followupLeads.length,
//       this.newEnrollments.length,
//       this.trainingStats.registeredLeads,
//       this.trainingStats.rejectedLeads
//     ];

//     this.chart = new Chart(ctx, {
//       type: 'bar',
//       data: {
//         labels: labels,
//         datasets: [{
//           label: 'Leads Overview',
//           data: dataCounts,
//           backgroundColor: [
//             '#36A2EB',
//             '#FFCE56',
//             '#4BC0C0',
//             '#FF6384'
//           ],
//           borderWidth: 1
//         }]
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         plugins: {
//           legend: {
//             display: false
//           }
//         },
//         scales: {
//           y: {
//             beginAtZero: true,
//             ticks: {
//               stepSize: 1
//             }
//           }
//         }
//       }
//     });
//   }, 100);
// }
  formatTimeForDisplay(time24: string): string {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    let hoursNum = parseInt(hours);
    const ampm = hoursNum >= 12 ? 'PM' : 'AM';
    hoursNum = hoursNum % 12;
    hoursNum = hoursNum ? hoursNum : 12;
    return `${hoursNum}:${minutes} ${ampm}`;
  }

  openDialog(id: string) {
    this.dialog.open(EditContactComponent, {
      data: {
        itemId: id,
      }
    }).afterClosed().subscribe(() => {
      this.loadDashboardData();
    });
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 3000
    });
  }

  announceSortChange(sortState: Sort) {
    // Implement sorting if needed
    console.log('Sort changed:', sortState);
  }
    // Add this method to your DashboardComponent class
formatTime(time24: string): string {
  if (!time24) return '—';
  const [hours, minutes] = time24.split(':');
  let hoursNum = parseInt(hours);
  const ampm = hoursNum >= 12 ? 'PM' : 'AM';
  hoursNum = hoursNum % 12;
  hoursNum = hoursNum ? hoursNum : 12; // Convert 0 to 12
  return `${hoursNum}:${minutes} ${ampm}`;
}
}
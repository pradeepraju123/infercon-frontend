import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AccountsService } from '../../services/accounts.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AccountDialogComponent } from '../account-dialog/account-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

// Define interface for account parameters
interface AccountParams {
  searchTerm?: string;
  page_size: number;
  page_num: number;
  status?: string;
  installmentType?: string;
  assignee?: string;
}

@Component({
  selector: 'app-all-accounts',
  templateUrl: './all-accounts.component.html',
  styleUrls: ['./all-accounts.component.css']
})
export class AllAccountsComponent implements OnInit {
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [];
  assigneeOptions: string[] = [];
  
  // Search and filter properties
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedAssignee: string = '';
  assigneeSearchTerm: string = ''; // Separate search term for assignee
  
  // Pagination properties
  pageSize = 10;
  pageNum = 1;
  totalItems: number = 0;
  totalPages: number = 1;
  itemsPerPage: number = 5;
  userType: any;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private accountService: AccountsService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getUsers();
    this.loadAllAccounts();
    this.getUserType();
  }

  getUsers() {
    this.userService.getAllUsers().subscribe(
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

  loadAllAccounts(): void {
    const params: AccountParams = {
      page_size: this.itemsPerPage,
      page_num: this.pageNum,
    };

    // Add search term if provided
    if (this.searchTerm) {
      params.searchTerm = this.searchTerm;
    }

    // Add status filter if selected
    if (this.selectedStatus) {
      params.status = this.selectedStatus;
    }

    // Add assignee filter if selected (admin only)
    if (this.userType === 'admin' && this.selectedAssignee) {
      params.assignee = this.selectedAssignee;
    }

    console.log('🔄 Loading accounts with params:', params);

    this.accountService.getAllAccounts(params).subscribe(
      (data: any) => {
        if (data && data.data) {
          // Map the data to ensure assigneeName is properly set
          const accounts = data.data.map((account: any) => ({
            ...account,
            assigneeName: account.assigneeName || 'Not Assigned'
          }));
          
          this.dataSource = new MatTableDataSource(accounts);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          
          this.totalItems = data.pagination?.total_items || data.data.length;
          this.totalPages = data.pagination?.total_pages || Math.ceil(this.totalItems / this.itemsPerPage);
          
          console.log('✅ Loaded accounts:', accounts.length);
        }
      },
      (error) => {
        console.error('Error fetching accounts:', error);
        this.snackBar.open('Error loading accounts', 'Close', { duration: 3000 });
      }
    );
  }

  onAssigneeSelect(selectedAssignee: string, contactRef: string) {
    if (!contactRef) {
      console.error('No contact ID provided');
      return;
    }

    // Update local data immediately for better UX
    const rowIndex = this.dataSource.data.findIndex(item => item.contactRef === contactRef);
    if (rowIndex !== -1) {
      this.dataSource.data[rowIndex].assigneeName = selectedAssignee;
      this.dataSource._updateChangeSubscription();
    }

    // Call API to update assignee
    this.accountService.updateAssignee(contactRef, selectedAssignee).subscribe({
      next: (response: any) => {
        console.log('Account assigned successfully:', response);
        this.snackBar.open(`Account assigned to ${selectedAssignee} successfully`, 'Close', {
          duration: 3000
        });
        
        // Reload data to ensure consistency
        this.loadAllAccounts();
      },
      error: (err: any) => {
        console.error('Error assigning account:', err);
        this.snackBar.open('Error assigning account', 'Close', {
          duration: 3000
        });
        
        // Revert local change on error
        if (rowIndex !== -1) {
          this.dataSource.data[rowIndex].assigneeName = 'Not Assigned';
          this.dataSource._updateChangeSubscription();
        }
      }
    });
  }

  getUserType(): void {
    const token = sessionStorage.getItem('authToken');
    this.userType = this.authService.getUserTypeFromToken(token);
    
    // Set columns based on user type
    if (this.userType === 'staff') {
      this.displayedColumns = [
        'contactName', 'email', 'phone', 'totalAmount', 
        'pendingAmount', 'paidAmount', 'pendingInstallments', 
        'overallStatus', 'assigneeSelection', 'actions'
      ];
    } else if (this.userType === 'admin') {
      this.displayedColumns = [
        'contactName', 'email', 'phone', 'totalAmount', 
        'pendingAmount', 'paidAmount', 'pendingInstallments', 
        'overallStatus', 'assigneeSelection', 'actions'
      ];
    }
  }

  // Reset filters
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedAssignee = '';
    this.pageNum = 1;
    this.loadAllAccounts();
  }

  // Handle assignee filter change
  onAssigneeFilterChange(): void {
    this.pageNum = 1; 
    this.loadAllAccounts();
  }

  
  searchByAssignee(): void {
    if (this.assigneeSearchTerm) {
      this.selectedAssignee = this.assigneeSearchTerm;
    } else {
      this.selectedAssignee = '';
    }
    this.pageNum = 1;
    this.loadAllAccounts();
  }

  // Clear assignee search
  clearAssigneeSearch(): void {
    this.assigneeSearchTerm = '';
    this.selectedAssignee = '';
    this.loadAllAccounts();
  }

  
  getPageNumbers(): number[] {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.pageNum - 2);
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
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
      this.loadAllAccounts();
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
      this.snackBar.open('Error: No contact ID available');
    }
  }
  
}
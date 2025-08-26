import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AccountsService } from '../../services/accounts.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-accounts',
  templateUrl: './all-accounts.component.html',
  styleUrls: ['./all-accounts.component.css']
})
export class AllAccountsComponent implements OnInit {
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['contactName', 'email', 'phone', 'totalAmount', 'pendingAmount', 'paidAmount', 'pendingInstallments', 'overallStatus', 'actions'];
  
  searchTerm: string = '';
  pageSize = 10;
  pageNum = 1;
  totalItems: number = 0;
  totalPages: number = 1;
  itemsPerPage: number = 10;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private accountService: AccountsService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllAccounts();
  }

  loadAllAccounts(): void {
    const params = {
      searchTerm: this.searchTerm,
      page_size: this.itemsPerPage,
      page_num: this.pageNum,
    };

    this.accountService.getAllAccounts(params).subscribe(
      (data: any) => {
        if (data && data.data) {
          this.dataSource = new MatTableDataSource(data.data);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          
          this.totalItems = data.pagination?.total_items || data.data.length;
          this.totalPages = data.pagination?.total_pages || Math.ceil(this.totalItems / this.itemsPerPage);
        }
      },
      (error) => {
        console.error('Error fetching accounts:', error);
        this.snackBar.open('Error loading accounts', 'Close', { duration: 3000 });
      }
    );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  viewAccountDetails(contactId: string): void {
    this.router.navigate(['/account', contactId]);
  }

  // Pagination methods
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
}
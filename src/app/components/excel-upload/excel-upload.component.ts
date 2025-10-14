// excel-upload.component.ts
import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactService } from '../../services/contact.service';
import { UploadStateService } from '../../services/upload-state.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';

interface ProcessedFee {
  amount: number;
  date: string;
}

interface ProcessedContact {
  fullname: string;
  email: string;
  phone: string;
  date_of_enquiry: string;
  source: string;
  student_code: string;
  course:string;
  course_name: string;
  staff_name: string;
  total_amount: number;
  vilt_cilt: string;
  outstanding: number;
  remarks: string;
   
  fees: ProcessedFee[];
   bank_charges: number; 
  bank_charges_date: string;
  status: string;
   excel_upload: number; 
}

interface UploadResult {
  insertedCount: number;
  skippedCount: number;
  skippedContacts: { phone: string; reason: string }[];
  processedData: ProcessedContact[];
  summary?: {
    totalRows: number;
    successful: number;
    skipped: number;
    feesProcessed: number;
  };
}

@Component({
  selector: 'app-excel-upload',
  templateUrl: './excel-upload.component.html',
  styleUrls: ['./excel-upload.component.css']
})
export class ExcelUploadComponent implements AfterViewInit, OnInit, OnDestroy {
  selectedFile: File | null = null;
  isDragOver = false;
  uploading = false;
  uploadResult: UploadResult | null = null;
  excelUploadedContacts: ProcessedContact[] = [];
pageSize = 5;
  pageNum = 1;
  
  totalItems: number = 0;
totalPages: number = 1;
itemsPerPage: number = 20;
  searchTerm: string = '';
  showAdvancedSearch: boolean = false;
  fieldFilters: any = {
    fullname: '',
    email: '',
    phone: '',
    course:'',
    course_name: '',
    staff_name: '',
    source: '',
    vilt_cilt: '',
  remarks: ''
  };
  dateRange: any = {
    startDate: null,
    endDate: null
  };
  
  // Table properties
  dataSource = new MatTableDataSource<any>([]);
  summary: any = null;

baseColumns: string[] = [
  'fullname', 
  'email', 
  'phone', 
  'date_of_enquiry', 
  'source', 
  'student_code', 
  'course',
  'course_name', 
  'staff_name', 
  'total_amount',
  'vilt_cilt',
  'outstanding',
  'remarks',
  'bank_charges', 
  'bank_charges_date'
];

  displayedColumns: string[] = [...this.baseColumns];
  
  private dataSubscription!: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private contactService: ContactService,
    private snackBar: MatSnackBar,
    private uploadStateService: UploadStateService
  ) {}

 applyFilter(): void {
  this.pageNum = 1; // Reset to first page when filtering
  if (this.searchTerm) {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  } else {
    this.dataSource.filter = '';
  }
  this.loadExcelUploadedContacts();
}

setupFilterPredicate(): void {
  this.dataSource.filterPredicate = (data: any, filter: string) => {
    const searchStr = filter.toLowerCase();
    
    // Search across multiple fields
    return (
      (data.fullname || '').toLowerCase().includes(searchStr) ||
      (data.email || '').toLowerCase().includes(searchStr) ||
      (data.phone || '').toLowerCase().includes(searchStr) ||
      (data.course || '').toLowerCase().includes(searchStr) ||
      (data.course_name || '').toLowerCase().includes(searchStr) ||
      (data.staff_name || '').toLowerCase().includes(searchStr) ||
      (data.source || '').toLowerCase().includes(searchStr) ||
      (data.vilt_cilt || '').toLowerCase().includes(searchStr) ||
      (data.remarks || '').toLowerCase().includes(searchStr) ||
      (data.student_code || '').toLowerCase().includes(searchStr)
    );
  };
}

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

applyAdvancedFilter(): void {
  this.pageNum = 1;
  this.loadExcelUploadedContacts();
}

// Update the method that creates filter params
private getFilterParams(): any {
  const params: any = {
    page_num: this.pageNum,
    page_size: this.itemsPerPage,
    searchTerm: this.searchTerm
  };

  // Add field filters
  Object.keys(this.fieldFilters).forEach(key => {
    if (this.fieldFilters[key]) {
      params[key] = this.fieldFilters[key];
    }
  });

  // Add date range
  if (this.dateRange.startDate) {
    params.startDate = this.dateRange.startDate.toISOString().split('T')[0];
  }
  if (this.dateRange.endDate) {
    params.endDate = this.dateRange.endDate.toISOString().split('T')[0];
  }

  return params;
}
  hasActiveFilters(): boolean {
    return Object.values(this.fieldFilters).some(value => value !== '') ||
           this.dateRange.startDate !== null ||
           this.dateRange.endDate !== null;
  }

  clearAdvancedFilters(): void {
    this.fieldFilters = {
      fullname: '',
      email: '',
      phone: '',
      course:'',
      course_name: '',
      staff_name: '',
      source: ''
    };
    this.dateRange = {
      startDate: null,
      endDate: null
    };
    this.applyAdvancedFilter();
  }

exportFilteredData(): void {
  const filteredData = this.dataSource.filteredData;
  
  if (filteredData.length === 0) {
    this.showError('No data to export');
    return;
  }

  const headers = this.displayedColumns;
  const csvData = [headers];
  
  filteredData.forEach(row => {
    const rowData = headers.map(header => {
      if (header.includes('_amount') || header.includes('_date')) {
        return this.getCellValue(row, header);
      }
      // Handle outstanding amount formatting
      if (header === 'outstanding') {
        return row[header] && row[header] > 0 ? '₹' + row[header] : '';
      }
      return row[header] || '';
    });
    csvData.push(rowData);
  });

  let csvContent = "data:text/csv;charset=utf-8,";
  csvData.forEach(row => {
    csvContent += row.join(",") + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `filtered_contacts_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  this.showSuccess(`Exported ${filteredData.length} contacts`);
}

ngOnInit() {
  // Load data from localStorage if available
  this.uploadStateService.loadPersistedData();

  // Subscribe to data updates
  this.dataSubscription = this.uploadStateService.processedData$.subscribe(data => {
    this.dataSource.data = data;
    this.updateDynamicColumns(data);
    this.setupTableFeatures();
  });

  // Subscribe to upload result
  this.dataSubscription.add(
    this.uploadStateService.uploadResult$.subscribe(result => {
      if (result) {
        this.summary = result.summary;
      }
    })
  );

  // Load Excel uploaded contacts when component initializes
  this.loadExcelUploadedContacts();
}

loadExcelUploadedContacts() {
  const params = {
    page_num: this.pageNum,
    page_size: this.itemsPerPage,
    searchTerm: this.searchTerm,
    ...this.fieldFilters,
    ...(this.dateRange.startDate && { startDate: this.dateRange.startDate }),
    ...(this.dateRange.endDate && { endDate: this.dateRange.endDate })
  };

  console.log('Sending params:', params); // Debug

  this.contactService.getExcelUploadedContacts(params).subscribe({
    next: (res) => {
      console.log('Full API response:', res); // Debug - check the actual structure
      console.log('Pagination data:', res.pagination); // Debug
      
      if (res.status_code === 200) {
        this.excelUploadedContacts = res.data || [];
        this.dataSource.data = this.excelUploadedContacts;
        
        // Update pagination info - FIX property names
        this.totalItems = res.pagination?.total_items || 0;
        this.totalPages = res.pagination?.total_pages || 1;
        
        console.log('Pagination calculated:', { // Debug
          totalItems: this.totalItems,
          totalPages: this.totalPages,
          pageNum: this.pageNum
        });
        
        this.updateDynamicColumns(this.excelUploadedContacts);
        this.setupTableFeatures();
      }
    },
    error: (err) => {
      console.error("Failed to fetch Excel uploaded contacts:", err);
      this.showError('Failed to load Excel uploaded contacts');
    }
  });
}


  private updateDynamicColumns(data: any[]): void {
    // Find maximum number of fees in the dataset
    const maxFees = data.reduce((max, row) => {
      return Math.max(max, row.fees ? row.fees.length : 0);
    }, 0);

    // Generate fee columns dynamically
    const feeColumns: string[] = [];
    for (let i = 0; i < maxFees; i++) {
      feeColumns.push(`fee${i + 1}_amount`, `fee${i + 1}_date`);
    }

    // Update displayed columns
    this.displayedColumns = [...this.baseColumns, ...feeColumns];
  }

  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  private loadPersistedData() {
    const savedData = this.uploadStateService.getProcessedData();
    const savedResult = this.uploadStateService.getUploadResult();
    
    if (savedData.length > 0) {
      this.dataSource.data = savedData;
      this.uploadResult = savedResult;
      this.summary = savedResult?.summary;
      this.setupTableFeatures();
      
      this.showSuccess('Previous upload data restored');
    }
  }

  private setupTableFeatures() {
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    });
  }

  ngAfterViewInit() {
    this.setupTableFeatures();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  private handleFile(file: File): void {
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      this.showError('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.showError('File size must be less than 10MB');
      return;
    }

    this.selectedFile = file;
    // Don't clear upload result when selecting new file if we have existing data
    if (this.dataSource.data.length === 0) {
      this.uploadResult = null;
      this.summary = null;
    }
  }

uploadFile(): void {
  if (!this.selectedFile) return;

  this.uploading = true;
  
  const formData = new FormData();
  formData.append('file', this.selectedFile);

  this.contactService.uploadExcel(formData).subscribe({
    next: (response: UploadResult & any) => {
      this.uploading = false;
      console.log('Upload response:', response);
      
      if (response.status_code === 200 || response.success) {
        this.showSuccess(
          `Excel processed successfully! ${response.insertedCount || 0} contacts added, ${response.skippedCount || 0} skipped.`
        );

        // Update with ALL processed data
        if (response.processedData && response.processedData.length > 0) {
          this.excelUploadedContacts = response.processedData.map((contact: ProcessedContact) => ({
            ...contact,
            phone: this.normalizePhone(contact.phone)
          }));

          this.dataSource.data = this.excelUploadedContacts;

          // Update dynamic columns & table features
          this.updateDynamicColumns(this.excelUploadedContacts);
          this.setupTableFeatures();

          // Persist data in service (and localStorage)
          this.uploadStateService.setProcessedData(this.excelUploadedContacts, response);
        }

        // Clear selected file and refresh data
        this.selectedFile = null;
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // Refresh the table data
        this.refreshDataAfterUpload();
      } else {
        this.showError(response.message || 'Upload failed');
      }
    },
    error: (error) => {
      this.uploading = false;
      console.error('Upload error:', error);

      let errorMessage = 'Error uploading file. Please try again.';
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      this.showError(errorMessage);
    }
  });
}


  removeFile(): void {
    this.selectedFile = null;
  }

  clearFile(): void {
    this.selectedFile = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  clearAll(): void {
    this.selectedFile = null;
    this.uploadResult = null;
    this.summary = null;
    
    // Clear through service (which will clear localStorage too)
    this.uploadStateService.clearData();
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    this.showSuccess('All data cleared successfully');
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatFees(fees: ProcessedFee[]): string {
    if (!fees || fees.length === 0) return 'No fees';
    
    return fees.map((fee, index) => 
      `Fee ${index + 1}: ₹${fee.amount} on ${fee.date || 'N/A'}`
    ).join(', ');
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

downloadTemplate(): void {
  const templateData = [
    [
      'FULLNAME', 'EMAIL', 'PHONE', 'DATE_OF_ENQUIRY', 'SOURCE', 
      'STUDENT CODE', 'COURSE NAME', 'STAFF', 'TOTAL AMOUNT',
      // NEW COLUMNS
      'VILT/CILT', 'OUTSTANDING', 'REMARKS',
      'RECEIVED FEE-1 AMOUNT', 'RECEIVED FEE-1 DATE',
      'RECEIVED FEE-2 AMOUNT', 'RECEIVED FEE-2 DATE',
      'RECEIVED FEE-3 AMOUNT', 'RECEIVED FEE-3 DATE',
      'RECEIVED FEE-4 AMOUNT', 'RECEIVED FEE-4 DATE',
      'RECEIVED FEE-5 AMOUNT', 'RECEIVED FEE-5 DATE',
      'RECEIVED FEE-6 AMOUNT', 'RECEIVED FEE-6 DATE',
      'RECEIVED FEE-7 AMOUNT', 'RECEIVED FEE-7 DATE'
    ],
    [
      'John Doe', 'john@example.com', '9876543210', '2024-01-15', 'Website',
      'STU001', 'Web Development', 'Staff Member', '50000',
      // NEW SAMPLE DATA
      'VILT', '13000', '27-Aug-2025',
      '10000', '2024-01-20', '15000', '2024-02-20', '', ''
    ],
    [
      'Jane Smith', 'jane@example.com', '9876543211', '2024-01-16', 'Referral',
      'STU002', 'Data Science', 'Another Staff', '60000',
      // NEW SAMPLE DATA
      'CILT', '0', 'Follow up required',
      '20000', '2024-01-25', '20000', '2024-02-25', '20000', '2024-03-25'
    ]
  ];

  let csvContent = "data:text/csv;charset=utf-8,";
  templateData.forEach(row => {
    csvContent += row.join(",") + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "contacts_template_with_fees.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

normalizePhone(phoneValue: any): string {
  if (!phoneValue) return '';

  // Case 1: ExcelJS object format
  if (typeof phoneValue === 'object' && phoneValue.text) {
    return phoneValue.text.trim();
  }

  // Case 2: Large number converted to exponential format
  if (typeof phoneValue === 'number') {
    // Convert safely, remove decimals or exponents
    return Math.trunc(phoneValue).toString();
  }

  // Case 3: Regular string — just clean up
  if (typeof phoneValue === 'string') {
    return phoneValue.replace(/[^0-9+]/g, '').trim();
  }

  return phoneValue.toString();
}

  getFeeAmount(fees: any[], index: number): number | null {
    if (!fees || !Array.isArray(fees) || fees.length <= index) {
      return null;
    }
    
    const fee = fees[index];
    if (fee && fee.amount && fee.amount > 0) {
      return fee.amount;
    }
    
    return null;
  }

  getFeeDate(fees: any[], index: number): string | null {
    if (!fees || !Array.isArray(fees) || fees.length <= index) {
      return null;
    }
    
    const fee = fees[index];
    if (fee && fee.date && this.isValidDate(fee.date)) {
      return fee.date;
    }
    
    return null;
  }

  formatDateDisplay(dateString: any): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime()) || date.getFullYear() < 1900 || date.getFullYear() > 2100) {
        return 'N/A';
      }
      
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  }

  isValidDate(dateString: any): boolean {
    if (!dateString) return false;
    
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100;
    } catch (error) {
      return false;
    }
  }

  getColumnHeader(columnName: string): string {
    if (columnName.includes('_amount')) {
      const feeNumber = columnName.replace('fee', '').replace('_amount', '');
      return `Fee ${feeNumber} Amount`;
    } else if (columnName.includes('_date')) {
      const feeNumber = columnName.replace('fee', '').replace('_date', '');
      return `Fee ${feeNumber} Date`;
    }
    return columnName;
  }

  getCellValue(row: any, columnName: string): string {
    if (columnName.includes('_amount')) {
      const feeIndex = parseInt(columnName.replace('fee', '').replace('_amount', '')) - 1;
      const amount = this.getFeeAmount(row.fees, feeIndex);
      return amount ? '₹' + amount : 'N/A';
    } else if (columnName.includes('_date')) {
      const feeIndex = parseInt(columnName.replace('fee', '').replace('_date', '')) - 1;
      const date = this.getFeeDate(row.fees, feeIndex);
      return this.formatDateDisplay(date);
    }
    return row[columnName] || 'N/A';
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
    this.loadExcelUploadedContacts();
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

private refreshDataAfterUpload() {
  // Small delay to ensure backend has processed the data
  setTimeout(() => {
    this.loadExcelUploadedContacts();
  }, 1000);
}
}
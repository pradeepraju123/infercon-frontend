import { Component,ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {SelectionModel} from '@angular/cdk/collections';
import { MatSort, Sort } from '@angular/material/sort';
import { WhatsappActivityService } from '../../services/whatsapp-activity.service';
import { Cities } from '../../model/cities.model';
import { cities } from '../../model/cities-data-store';
import { countries } from '../../model/country-data-store';
import { Countries } from '../../model/country.model';
import { IndianState, indianStates } from '../../model/state-data';
import { FormGroup, FormControl } from '@angular/forms';
import { ContactService } from '../../services/contact.service';


import {
  MatDialog,
} from '@angular/material/dialog';
import { EditContactComponent } from '../../components/edit-contact/edit-contact.component';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';


@Component({
  selector: 'app-whatsapp-activity',
  templateUrl: './whatsapp-activity.component.html',
  styleUrl: './whatsapp-activity.component.css'
})
export class WhatsappActivityComponent {
  
  filterForm!: FormGroup;
  totalContacts: number = 0;
  contacts: any[] = []; // ✅ this avoids the 'possibly undefined' error
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  userType: any


  successMessage: string | null = null;
  errorMessage: string | null = null;
    
  displayedColumns: string[] = ['year', 'data']; // Table column headers
  dataSource = new MatTableDataSource<any>(); // Data for Material Table
  selectedCity: string = ''; 

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  selection = new SelectionModel<any>(true, []);

  constructor(
    private whatsappActivityService: WhatsappActivityService,
    private _snackBar: MatSnackBar,
    private contactService: ContactService,
    public dialog: MatDialog,

  ) {}
  selectedFile: File | null = null;
  fileError: string | null = null;

  ngOnInit(): void {
    // this.loadCities();
    // this.loadCountries();
     this.getAllContact();
    // this.loadStates();
    this.initializeForm();
    // this.sendmessage_filtercontact();

    console.log('hi');
   }
   
  //  loadCities() {
  //   this.cities = cities; // Assign imported cities array to the component property
  //   console.log('Loaded Cities:', this.cities);
  // }
  // loadCountries() {
  //   this.countries = countries; // Assign imported cities array to the component property
  //   console.log('Loaded Cities:', this.countries);
  // }
  // loadStates() {
  //   this.states = indianStates; // Assign data from state-data.ts
  //   console.log('Loaded States:', this.states);
  // }
  initializeForm() {
    this.filterForm = new FormGroup({
      // country: new FormControl([]), // Multi-select for country
      // states: new FormControl([]), // Multi-select for states
      // cities: new FormControl([]), // Multi-select for cities
      startDate: new FormControl(''),
      endDate: new FormControl('')
    });
  }
  submitForm() {
    this.whatsappActivityService.sendmessage_filtercontact(this.filterForm.value).subscribe(
      (response: any) => {
        console.log('Contacts retrieved successfully:', response);
        console.log(this.contacts);
      },
      (error) => {
        console.error('Error while getting contacts:', error);
      }
    );
    console.log('Form Data:', this.filterForm.value);
  }


  getAllContact() {
    this.whatsappActivityService.getAllContact().subscribe(
      (response: any) => {
        console.log('Contacts retrieved successfully:', response);
        
        if (response.status_code === 200) {
          this.contacts = response.contacts || [];
        this.totalPages = Math.ceil(this.contacts.length / this.pageSize);
        } else {
          console.error('Unexpected response format:', response);
        }
      },
      (error) => {
        console.error('Error while getting contacts:', error);
      }
    );
  }
  paginatedContacts(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.contacts.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

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

  uploadFile() {
    if (!this.selectedFile) {
      this.fileError = "Please select a file first!";
      return;
    }
    console.log(this.selectedFile);

    const formData = new FormData();
    formData.append("file", this.selectedFile);
    
    this.contactService.uploaduser(formData).subscribe(
      (response) => {
        this.successMessage = 'File uploaded successfully.';
        this.openSnackBar(this.successMessage)
        console.log('File uploaded successfully', response);
        this.userType = response;
      },
      (error) => {
        console.error('Error uploading file:', error);
        this.fileError = 'Error uploading file. Please try again.';
        this.openSnackBar(this.fileError)
      }
    );


  }
  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', 
    {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
  
}




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

  cities: Cities[] = [];
  states: IndianState[] = [];
  countries:Countries[]=[];
    contacts: any[] = []; // Store flattened contact list
  displayedColumns: string[] = ['year', 'data']; // Table column headers
  dataSource = new MatTableDataSource<any>(); // Data for Material Table
  selectedCity: string = ''; 

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private whatsappActivityService: WhatsappActivityService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCities();
    this.loadCountries();
    this.getAllContact();
    this.loadStates();
    this.initializeForm();
    // this.sendmessage_filtercontact();

    console.log('hi');
   }
   
   loadCities() {
    this.cities = cities; // Assign imported cities array to the component property
    console.log('Loaded Cities:', this.cities);
  }
  loadCountries() {
    this.countries = countries; // Assign imported cities array to the component property
    console.log('Loaded Cities:', this.countries);
  }
  loadStates() {
    this.states = indianStates; // Assign data from state-data.ts
    console.log('Loaded States:', this.states);
  }
  initializeForm() {
    this.filterForm = new FormGroup({
      country: new FormControl([]), // Multi-select for country
      states: new FormControl([]), // Multi-select for states
      cities: new FormControl([]), // Multi-select for cities
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
  flattenContacts(data: any): any[] {
    let contactsArray: any[] = [];
    let total = 0;
  
    Object.keys(data).forEach((yearKey) => {
      const yearData = data[yearKey];
      total += yearData.total; // Sum up total contacts
  
      Object.keys(yearData.contacts).forEach((monthKey) => {
        const monthContacts = yearData.contacts[monthKey];
  
        // Add year and month information for display
        monthContacts.forEach((contact: any) => { // ✅ Explicitly define 'any'
          contact.year = yearKey.replace("contacts_", ""); // Extract year from key
          contact.month = monthKey; // Add month information
        });
  
        contactsArray = [...contactsArray, ...monthContacts];
      });
    });
  
    this.totalContacts = total; // Assign total count to a variable
    return contactsArray;
}

  getAllContact() {
    this.whatsappActivityService.getAllContact().subscribe(
      (response: any) => {
        console.log('Contacts retrieved successfully:', response);
        
        if (response.status_code === 200) {
          this.contacts = this.flattenContacts(response.data);
          console.log('Flattened Contacts:', this.contacts);
          console.log('Total Contacts:', this.totalContacts);
        } else {
          console.error('Unexpected response format:', response);
        }
      },
      (error) => {
        console.error('Error while getting contacts:', error);
      }
    );
  }
  
}




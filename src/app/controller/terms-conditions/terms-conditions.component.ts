import { Component, OnInit } from '@angular/core';
import { GeneralService } from '../../services/general.service';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrl: './terms-conditions.component.css'
})
export class TermsConditionsComponent implements OnInit {
  showText: boolean = false;
  general: any[]=[]; // Define a property to store the fetched data
  contentLoaded: boolean = false;
  data = {}
  constructor(private generalService: GeneralService) { };

  ngOnInit(): void {
    this.fetchAll();
  }
  fetchAll(): void {
    this.generalService.getAllGeneraldata().subscribe((data: any) => {
      this.general = data.data;
      this.contentLoaded = true;
    });
  }
}

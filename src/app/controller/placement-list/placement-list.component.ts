import { Component, Input } from '@angular/core';
import { PlacementService } from '../../services/placement.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PlacementComponent } from '../placement/placement.component';
import { PlacementEnquiryComponent } from '../../components/placement-enquiry/placement-enquiry.component';

@Component({
  selector: 'app-placement-list',
  templateUrl: './placement-list.component.html',
  styleUrl: './placement-list.component.css'
})
export class PlacementListComponent {
// contentLoaded = false;
contentLoaded: boolean = false;
@Input() showButton: boolean = true;

generaldata: any[]=[]; // Define a property to store the fetched data

constructor(private careerlistServices: PlacementService, private router: Router,public dialog: MatDialog) { };
ngOnInit(): void {
  this.careerlistServices.getAllCareerListGetAPI().subscribe((data: any) => {
    this.contentLoaded = true;
    this.generaldata = data.data;
},
(error) => {
console.error('Error loading data: ', error);
// Handle the error (e.g., show an error message or retry the request)
}
);
}
openDialog(_id: String) {
  this.dialog.open(PlacementComponent, {
    data: {
      itemId: _id,
    }
  });
}

openDialogPlacementEnquiry(job_id: String) {
  this.dialog.open(PlacementEnquiryComponent, {
    data: {
      itemId: job_id
    }
  });
}


}

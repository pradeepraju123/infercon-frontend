import { Component, Input } from '@angular/core';
import { PlacementService } from '../../services/placement.service';
import { Router } from '@angular/router';  // Import the Router
import { MatDialog } from '@angular/material/dialog';
import { EditPlacementComponent } from '../../controller/edit-placement/edit-placement.component';
@Component({
  selector: 'app-placement-cardview',
  templateUrl: './placement-cardview.component.html',
  styleUrl: './placement-cardview.component.css'
})
export class PlacementCardviewComponent {
// contentLoaded = false;
contentLoaded: boolean = false;
@Input() showButton: boolean = true;

generaldata: any[]=[]; // Define a property to store the fetched data

constructor(private careerlistServices: PlacementService, private router: Router,public dialog: MatDialog) { };
editServices(serviceId: String) {
  this.router.navigate(['/app-edit-blog', serviceId]);  // Navigate to the edit component with the ID
}
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
  this.dialog.open(EditPlacementComponent, {
    data: {
      itemId: _id,
    }
  });
}
}

import { Component } from '@angular/core';
import { PlacementService } from '../../services/placement.service';
import { EditPlacementComponent } from '../../controller/edit-placement/edit-placement.component';
import { Router } from '@angular/router';  // Import the Router
import {
  MatDialog,
} from '@angular/material/dialog';
@Component({
  selector: 'app-placement-tableview',
  templateUrl: './placement-tableview.component.html',
  styleUrl: './placement-tableview.component.css'
})
export class PlacementTableviewComponent {
  generaldata: any[]=[]; // Define a property to store the fetched data

  constructor(private placementService: PlacementService, private router: Router, public dialog: MatDialog) { };
  editServices(serviceId: String) {
    this.router.navigate(['/app-edit-services', serviceId]);  // Navigate to the edit component with the ID
  }
  openDialog(_id: String) {
    this.dialog.open(EditPlacementComponent, {
      data: {
        itemId: _id,
      }
    });
  }
  
  ngOnInit(): void {
    this.placementService.getAllCareerListGetAPI().subscribe((data: any) => {
      this.generaldata = data.data;
    });
  }
}

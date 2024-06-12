import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  MatDialog,
} from '@angular/material/dialog';
import { AddPlacementComponent } from '../add-placement/add-placement.component';
@Component({
  selector: 'app-placement-admin',
  templateUrl: './placement-admin.component.html',
  styleUrl: './placement-admin.component.css'
})
export class PlacementAdminComponent {
  isCardView = true;

  toggleView() {
    this.isCardView = !this.isCardView;
  }
  constructor(private router: Router, public dialog: MatDialog) { }
  redirectToCreateBlogs() {
    this.router.navigate(['/app-add-blog']); // Navigate to the 'addtraining' component
  }
  openDialog() {
    this.dialog.open(AddPlacementComponent);
  }
}

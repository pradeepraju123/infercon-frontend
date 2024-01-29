import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  MatDialog,
} from '@angular/material/dialog';
import { AddGeneralComponent } from '../add-general/add-general.component';
@Component({
  selector: 'app-general-admin',
  templateUrl: './general-admin.component.html',
  styleUrl: './general-admin.component.css'
})
export class GeneralAdminComponent {
  isCardView = true;

  toggleView() {
    this.isCardView = !this.isCardView;
  }
  constructor(private router: Router, public dialog: MatDialog) { }
  redirectToCreateBlogs() {
    this.router.navigate(['/app-add-blog']); // Navigate to the 'addtraining' component
  }
  openDialog() {
    this.dialog.open(AddGeneralComponent);
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';  // Import the Router
import {
  MatDialog,
} from '@angular/material/dialog';
import { EditBlogComponent } from '../../controller/edit-blog/edit-blog.component';
import { GeneralService } from '../../services/general.service';
@Component({
  selector: 'app-generaldata-tableview',
  templateUrl: './generaldata-tableview.component.html',
  styleUrl: './generaldata-tableview.component.css'
})
export class GeneraldataTableviewComponent {
  generaldata: any[]=[]; // Define a property to store the fetched data

  constructor(private generalService: GeneralService, private router: Router, public dialog: MatDialog) { };
  editServices(serviceId: String) {
    this.router.navigate(['/app-edit-services', serviceId]);  // Navigate to the edit component with the ID
  }
  openDialog(_id: String) {
    this.dialog.open(EditBlogComponent, {
      data: {
        itemId: _id,
      }
    });
  }
  
  ngOnInit(): void {
    this.generalService.getAllGeneraldata().subscribe((data: any) => {
      this.generaldata = data.data;
    });
  }
}

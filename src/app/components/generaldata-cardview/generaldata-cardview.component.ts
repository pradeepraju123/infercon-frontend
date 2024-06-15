import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';  // Import the Router
import { GeneralService } from '../../services/general.service';
import { MatDialog } from '@angular/material/dialog';
import { EditGeneralComponent } from '../../controller/edit-general/edit-general.component';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-generaldata-cardview',
  templateUrl: './generaldata-cardview.component.html',
  styleUrl: './generaldata-cardview.component.css'
})
export class GeneraldataCardviewComponent {
// contentLoaded = false;
contentLoaded: boolean = false;
@Input() showButton: boolean = true;

generaldata: any[]=[]; // Define a property to store the fetched data

constructor(private blogService: GeneralService, private router: Router,public dialog: MatDialog, public snackBar: MatSnackBar) { };
editServices(serviceId: String) {
  this.router.navigate(['/app-edit-blog', serviceId]);  // Navigate to the edit component with the ID
}
ngOnInit(): void {
  this.blogService.getAllGeneraldata().subscribe((data: any) => {
    this.contentLoaded = true;
    this.generaldata = data.data;
},
(error) => {
console.error('Error loading data: ', error);
// Handle the error (e.g., show an error message or retry the request)
}
);
}
deleteTraining(serviceId: string) {
  this.blogService.deleteGeneral(serviceId).subscribe(() => {
    this.generaldata = this.generaldata.filter(blog => blog.id !== serviceId); // Assuming blog has an id property
    this.snackBar.open('Blog deleted successfully', 'Close', {
      duration: 3000,
    });
  }, (error) => {
    console.error('Error deleting blog: ', error);
    this.snackBar.open('Failed to delete blog', 'Close', {
      duration: 3000,
    });
  });
}
openDialog(_id: String) {
  this.dialog.open(EditGeneralComponent, {
    data: {
      itemId: _id,
    }
  });
}
}

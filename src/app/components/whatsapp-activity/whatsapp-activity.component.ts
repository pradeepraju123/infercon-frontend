import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {SelectionModel} from '@angular/cdk/collections';
import { MatSort, Sort } from '@angular/material/sort';
import { WhatsappActivityService } from '../../services/whatsapp-activity.service';

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
  constructor(private WhatsappActivityService: WhatsappActivityService, 
    private _liveAnnouncer: LiveAnnouncer, 
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,  
    private getUsername: UserService, 
    private authService: AuthService,

    ) {}
    ngOnInit(): void {
      this.getAllContact();
     
    }
  selectedFile: File | null = null;
  fileError: string | null = null;
  
  getAllContact() {
    this.WhatsappActivityService.getAllContact().subscribe(
      response => {
        console.log('Contact updated successfully:', response);
       
         
      },
      (error) => {
        console.error('Error while get user:', error);
      }
    );
  }

}

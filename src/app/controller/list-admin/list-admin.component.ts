import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';  // Import the Router
import { MatDialog } from '@angular/material/dialog';
import { AddAdminComponent } from '../add-admin/add-admin.component';
@Component({
  selector: 'app-list-admin',
  templateUrl: './list-admin.component.html',
  styleUrl: './list-admin.component.css'
})
export class ListAdminComponent {
  contentLoaded = false;
  users: any[] = []; // Define a property to store the fetched data
  filteredTrainings: any[] = []; // Add a property to store filtered data
  searchTerm: string = '';
  data : any
  constructor(private userService: UserService, public dialog: MatDialog) {}



  fetchAllUsers(): void {
    const param = {
      searchTerm: this.searchTerm
    };
    this.userService.getAllUsersPost(param).subscribe((data: any) => {
      this.users = data.data;
      console.log(this.users)
    });
  }
  ngOnInit(): void {
    this.fetchAllUsers();
  }
  openDialog(_id: String) {
    this.dialog.open(AddAdminComponent, {
      data: {
        itemId: _id,
      }
    });
  }
  openDialogAdd() {
    this.dialog.open(AddAdminComponent);
  }
  private formatDate(date: string): string {
    return new Date(date).toISOString();
  }
}

import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';  // Import the Router
import { BlogService } from '../../services/blog.service';
import { EditBlogComponent } from '../../controller/edit-blog/edit-blog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-blog-cardview',
  templateUrl: './blog-cardview.component.html',
  styleUrls: ['./blog-cardview.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class BlogCardviewComponent {
  // contentLoaded = false;
  contentLoaded: boolean = false;
  @Input() showButton: boolean = true;
  
  blogdata: any[]=[]; // Define a property to store the fetched data
  
  constructor(private blogService: BlogService, private router: Router,public dialog: MatDialog, private snackBar: MatSnackBar) { };
  editServices(serviceId: String) {
    this.router.navigate(['/app-edit-blog', serviceId]);  // Navigate to the edit component with the ID
  }

  deleteBlogData(serviceId: string) {
    this.blogService.deleteBlog(serviceId).subscribe(() => {
      this.blogdata = this.blogdata.filter(blog => blog.id !== serviceId); // Assuming blog has an id property
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
  ngOnInit(): void {
    this.blogService.getAllblogs().subscribe((data: any) => {
      this.contentLoaded = true;
      this.blogdata = data.data;
},
(error) => {
  console.error('Error loading data: ', error);
  // Handle the error (e.g., show an error message or retry the request)
}
);
  }
  openDialog(_id: String) {
    this.dialog.open(EditBlogComponent, {
      data: {
        itemId: _id,
      }
    });
  }
  
}

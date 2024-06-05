import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UploadService } from '../../services/upload.service';
import { Location } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { BlogService } from '../../services/blog.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';
@Component({
  selector: 'app-add-blog',
  templateUrl: './add-blog.component.html',
  styleUrls: ['./add-blog.component.css'],
  animations: [
    trigger('toggleAnimation', [
      state('true', style({ transform: 'translateX(30px)' })), // Adjust the values as needed
      state('false', style({ transform: 'translateX(0)' })),
      transition('* <=> *', animate('0.3s ease-in-out')),
    ]),
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AddBlogComponent implements OnInit,OnDestroy {
  editor!: Editor;
  neweditor!: Editor;
  toolbarnew: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  blogdata = {
    title: '',
    author: '',
    description: '',
    type_: '',
    short_description: '',
    image: '',
    published: false
  };

  image: File | null = null;
  imagePreview: string | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center'; // Adjust as necessary
  verticalPosition: MatSnackBarVerticalPosition = 'top'; // Adjust as necessary

  constructor(
    private blogService: BlogService,
    private uploadService: UploadService,
    private _snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddBlogComponent>,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.editor = new Editor();
    this.neweditor = new Editor();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
    this.neweditor.destroy();
  }

  fileEvent(event: any): void {
    const file = event.target.files[0];
    this.image = file;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  displayImagePreview(file: File): void {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        if (event && event.target) {
          this.imagePreview = event.target.result as string;
        } else {
          console.error('Event or event.target is null.');
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.image) {
      this.uploadService.uploadImage(this.image).subscribe(
        (fileName) => {
          this.blogdata.image = fileName;
          this.createBlogsnew();
        },
        (error) => {
          console.error('Failed to upload the image:', error);
        }
      );
    } else {
      this.createBlogsnew();
    }
  }

  createBlogsnew(): void {
    // Convert the editor content to JSON strings
    const descriptionContent = JSON.stringify(this.blogdata.description);
    const shortDescriptionContent = JSON.stringify(this.blogdata.short_description);

    // Remove the surrounding quotes added by JSON.stringify
    this.blogdata.description = descriptionContent.slice(1, -1);
    this.blogdata.short_description = shortDescriptionContent.slice(1, -1);

    this.blogService.createBlogs(this.blogdata).subscribe(
      () => {
        this.successMessage = 'Blog was created successfully.';
        this.errorMessage = null;
        this.openSnackBar(this.successMessage);
        this.dialogRef.close();
      },
      (error) => {
        this.errorMessage = 'Failed to create blog.';
        this.successMessage = null;
        this.openSnackBar(this.errorMessage);
      }
    );
  }

  goBack(): void {
    this.location.back();
  }

  toggleSwitch(): void {
    this.blogdata.published = !this.blogdata.published;
  }

  openSnackBar(message: string): void {
    this._snackBar.open(message, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
}
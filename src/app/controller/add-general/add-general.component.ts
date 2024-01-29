import { Component, OnDestroy, OnInit,ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UploadService } from '../../services/upload.service';
import { Location } from '@angular/common';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { GeneralService } from '../../services/general.service';
import { Editor, Toolbar } from 'ngx-editor';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
@Component({
  selector: 'app-add-general',
  templateUrl: './add-general.component.html',
  styleUrl: './add-general.component.css', 
  animations: [
    trigger('toggleAnimation', [
      state('true', style({ transform: 'translateX(30px)' })), // Adjust the values as needed
      state('false', style({ transform: 'translateX(0)' })),
      transition('* <=> *', animate('0.3s ease-in-out')),
    ]),
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AddGeneralComponent implements OnInit, OnDestroy {
  filedata:any;
  generaldata: any = {}; // Initialize with an empty object
  successMessage: string | null = null;
  errorMessage: string | null = null;
  editor!: Editor;
  neweditor!: Editor;
  image: string | null = null; // To store the selected image file
  imagePreview : any;
  generalForm!: FormGroup;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];
  constructor(private route: ActivatedRoute, 
    private generalService: GeneralService,  
    private uploadService : UploadService, 
    private location : Location,
    private _snackBar: MatSnackBar, 
    private dialogRef: MatDialogRef<AddGeneralComponent>, 
    private fb: FormBuilder) {}

  // imageUrl: Observable<string>;
  ngOnInit(): void {
    this.initializeForm()
    this.editor = new Editor();
    this.neweditor = new Editor();  // Copy form values to your data object
  }
  fileEvent(event: any) {
    // Handle the file input change event
    const file = event.target.files[0];
    this.image = file;
    
    // Display a preview of the new image
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.image = file;
    }
  }
  displayImagePreview(file: File) {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event && event.target) {
          this.imagePreview = event.target.result as string;
        } else {
          // Handle the case where event or event.target is null
          console.error('Event or event.target is null.');
        }
      };
      reader.readAsDataURL(file);
    }
  }
  onSubmit() {
    const generalFormGroup = this.createForm();
    if (this.image) {
      // First, upload the image and get the filename
      this.uploadService.uploadImage(this.image).subscribe(
        (fileName) => {
          generalFormGroup.controls['image'].setValue(fileName); // Update the 'image' property of the training object with the filename
          this.createGeneral(generalFormGroup); // Proceed to update the training
        },
        (error) => {
          // Handle the case where image upload fails
          console.error('Failed to upload the image:', error);
        }
      );
    } else {
      this.createGeneral(generalFormGroup); // Update the training without an image
    }
  }
  createForm(): FormGroup {
    return this.fb.group({
      title: [this.generalForm.value.title, Validators.required],
      description: [this.generalForm.value.description],  // Adjust validators as needed
      short_description: [this.generalForm.value.short_description],  // Adjust validators as needed
      image: [''],
      published: [this.generalForm.value.published],  // Assuming this is a boolean property
    });
  }
  
  createGeneral(generalFormGroup: FormGroup) {
    this.generalService.createGeneraldata(generalFormGroup.value)
      .subscribe(
        () => {
          this.successMessage = 'General data was created successfully.';
          this.errorMessage = null;
          this.openSnackBar(this.successMessage)
          this.dialogRef.close();
        },
        (error) => {
          this.errorMessage = 'Failed to create training.';
          this.successMessage = null;
          this.openSnackBar(this.errorMessage)
        }
      );
  }
  goBack(): void {
    this.location.back(); // This uses the Angular Location service to navigate back.
  }
  toggleSwitch() {
    const publishedControl = this.generalForm.get('published');
    if (publishedControl) {
      publishedControl.setValue(!publishedControl.value);
    }
  }
  initializeForm() {
    this.generalForm = this.fb.group({
      title: ['', Validators.required],
      short_description: [''],
      description: [''],
      published: [false],
      image: ['']
    });
  }
  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', 
    {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
  ngOnDestroy(): void {
    this.editor.destroy();
    this.neweditor.destroy();
  }
  
}

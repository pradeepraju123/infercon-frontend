import { Component, OnInit,OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UploadService } from '../../services/upload.service';
import { Location } from '@angular/common';
import {
  MAT_DIALOG_DATA, MatDialogRef,
} from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';
import { GeneralService } from '../../services/general.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
@Component({
  selector: 'app-edit-general',
  templateUrl: './edit-general.component.html',
  styleUrl: './edit-general.component.css'
})
export class EditGeneralComponent implements OnInit,OnDestroy {
  filedata:any;
  generaldata: any = {}; // Initialize with an empty object
  editor!: Editor;
  neweditor!: Editor;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  image: string | null = null; // To store the selected image file
  imagePreview : any;
  generalForm!: FormGroup;
  generalId: string | null = null; // Add a property to store the training ID
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
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  constructor(private route: ActivatedRoute, 
    private generalService: GeneralService,  
    private uploadService : UploadService, 
    private location : Location, 
    @Inject(MAT_DIALOG_DATA) public data: {itemId: string},
    private _snackBar: MatSnackBar, 
    private dialogRef: MatDialogRef<EditGeneralComponent>, 
    private fb: FormBuilder) {}
  // imageUrl: Observable<string>;
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
  ngOnInit(): void {
    this.editor = new Editor();
    this.neweditor = new Editor();
    this.initializeForm();
    const id = this.data.itemId;
    if (id){
      this.generalId = id;
      if (this.generalId) {
        this.getGeneral(this.generalId);
      }
    }
     
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
    const trainingFormGroup = this.createGeneralFormGroup();
    if (this.image) {
      // First, upload the image and get the filename
      this.uploadService.uploadImage(this.image).subscribe(
        (fileName) => {
          // Update the image parameter only when an image is selected
          trainingFormGroup.controls['image'].setValue(fileName);// Update the 'image' property of the training object with the filename
          this.updategeneral(trainingFormGroup); // Proceed to update the training
        },
        (error) => {
          // Handle the case where image upload fails
          console.error('Failed to upload the image:', error);
        }
      );
    } else {
      this.updategeneral(trainingFormGroup); // Update the training without an image
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
  updategeneral(generalFormGroup: FormGroup) {
    if (this.generalId) {
      this.generalService.updateGeneraldata(this.generalId, generalFormGroup.value).subscribe(
        () => {
          this.successMessage = 'General data was updated successfully.';
          this.errorMessage = null;
          this.openSnackBar(this.successMessage)
          this.dialogRef.close();
        },
        (error) => {
          this.errorMessage = 'Failed to update general data.';
          this.successMessage = null;
          this.openSnackBar(this.errorMessage)
          this.dialogRef.close();
        }
      );
    }
  }

  getGeneral(generalId: string) {
    this.generalService.getGeneraldata(generalId).subscribe(
      (generalDetails) => {
        // Populate the static form controls
        this.generalForm.patchValue({
          title: generalDetails.title,
          short_description: generalDetails.short_description,
          description: generalDetails.description,
          published: generalDetails.published,
          image: generalDetails.image,
        });
  
        // Display the image preview
        this.displayImagePreview(generalDetails.image);
      },
      (error) => {
        console.error('Failed to fetch General details:', error);
      }
    );
  }
  createGeneralFormGroup(): FormGroup {
    const formGroupConfig: any = {
      title: [this.generalForm.value.title, Validators.required],
      short_description: [this.generalForm.value.short_description],
      description: [this.generalForm.value.description],
      published: [this.generalForm.value.published]
    };
  
    // Check if image exists and conditionally add the image control
    if (this.image) {
      formGroupConfig['image'] = [''] as any; // Type assertion here
    }
  
    return this.fb.group(formGroupConfig);
  }
  goBack(): void {
    this.location.back(); // This uses the Angular Location service to navigate back.
  }
  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', 
    {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
  toggleSwitch() {
    const publishedControl = this.generalForm.get('published');
    if (publishedControl) {
      publishedControl.setValue(!publishedControl.value);
    }
  }
  ngOnDestroy(): void {
    this.editor.destroy();
    this.neweditor.destroy();
  }
}

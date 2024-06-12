import { Component, OnDestroy, OnInit,ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UploadService } from '../../services/upload.service';
import { Location } from '@angular/common';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { PlacementService } from '../../services/placement.service';
import { Editor, Toolbar } from 'ngx-editor';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
@Component({
  selector: 'app-add-placement',
  templateUrl: './add-placement.component.html',
  styleUrl: './add-placement.component.css',
  animations: [
    trigger('toggleAnimation', [
      state('true', style({ transform: 'translateX(30px)' })), // Adjust the values as needed
      state('false', style({ transform: 'translateX(0)' })),
      transition('* <=> *', animate('0.3s ease-in-out')),
    ]),
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AddPlacementComponent implements OnInit, OnDestroy {
  filedata:any;
  generaldata: any = {}; // Initialize with an empty object
  successMessage: string | null = null;
  errorMessage: string | null = null;
  editor!: Editor;
  neweditor!: Editor;
  image: string | null = null; // To store the selected image file
  imagePreview : any;
  randomNumber: any;
  careerListForm!: FormGroup;
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
    private placementService: PlacementService,  
    private location : Location,
    private _snackBar: MatSnackBar, 
    private dialogRef: MatDialogRef<AddPlacementComponent>, 
    private fb: FormBuilder) {}

// imageUrl: Observable<string>;
ngOnInit(): void {
  this.initializeForm()
  this.randomNumber = Math.floor(1000 + Math.random() * 9000);
  this.editor = new Editor();
  this.neweditor = new Editor();  // Copy form values to your data object
}
onSubmit() {
  const generalFormGroup = this.createForm();
    this.createCareerList(generalFormGroup); // Update the training without an image
}
createForm(): FormGroup {
  return this.fb.group({
    job_id: [this.randomNumber, Validators.required],
    company_name: [this.careerListForm.value.company_name],  // Adjust validators as needed
    job_title: [this.careerListForm.value.job_title],  // Adjust validators as needed
    experience: [this.careerListForm.value.experience],
    work_location: [this.careerListForm.value.work_location],
    job_description: [this.careerListForm.value.job_description],
    skills: [this.careerListForm.value.skills],
    published: [this.careerListForm.value.published],  // Assuming this is a boolean property
  });
}

createCareerList(generalFormGroup: FormGroup) {
  this.placementService.createCareerList(generalFormGroup.value)
    .subscribe(
      () => {
        this.successMessage = 'Career list data was created successfully.';
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
  const publishedControl = this.careerListForm.get('published');
  if (publishedControl) {
    publishedControl.setValue(!publishedControl.value);
  }
}
initializeForm() {
  this.careerListForm = this.fb.group({
    job_id: ['', Validators.required],
    company_name: [''],  // Adjust validators as needed
    job_title: [''],  // Adjust validators as needed
    experience: [''],
    work_location: [''],
    job_description: [''],
    skills: [''],
    published: [false],  // Assuming this is a boolean property
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


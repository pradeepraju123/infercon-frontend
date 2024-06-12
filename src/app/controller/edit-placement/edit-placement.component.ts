import { Component, OnInit,OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {
  MAT_DIALOG_DATA, MatDialogRef,
} from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';
import { GeneralService } from '../../services/general.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { PlacementService } from '../../services/placement.service';
@Component({
  selector: 'app-edit-placement',
  templateUrl: './edit-placement.component.html',
  styleUrl: './edit-placement.component.css'
})
export class EditPlacementComponent {
  generaldata: any = {}; // Initialize with an empty object
  editor!: Editor;
  neweditor!: Editor;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  careerListForm!: FormGroup;
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
    private placementService: PlacementService,  
    private location : Location, 
    @Inject(MAT_DIALOG_DATA) public data: {itemId: string},
    private _snackBar: MatSnackBar, 
    private dialogRef: MatDialogRef<EditPlacementComponent>, 
    private fb: FormBuilder) {}
  // imageUrl: Observable<string>;
  ngOnInit(): void {
    this.editor = new Editor();
    this.neweditor = new Editor();
    this.initializeForm();
    const id = this.data.itemId;
    if (id){
      this.generalId = id;
      if (this.generalId) {
        this.getCareerLIST(this.generalId);
      }
    }
     
  }

  onSubmit() {
    const trainingFormGroup = this.createCareerListFormGroup();
      this.updateCareerList(trainingFormGroup); // Update the training without an image

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
  updateCareerList(generalFormGroup: FormGroup) {
    if (this.generalId) {
      this.placementService.updateCareerList(this.generalId, generalFormGroup.value).subscribe(
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

  getCareerLIST(generalId: string) {
    this.placementService.getCareerList(generalId).subscribe(
      (generalDetails) => {
        // Populate the static form controls
        this.careerListForm.patchValue({
          job_id: generalDetails.job_id,
          company_name: generalDetails.company_name,
          job_title: generalDetails.job_title,
          published: generalDetails.published,
          experience: generalDetails.experience,
          work_location: generalDetails.work_location,
          job_description: generalDetails.job_description,
          skills: generalDetails.skills
        });
  
      },
      (error) => {
        console.error('Failed to fetch General details:', error);
      }
    );
  }
  createCareerListFormGroup(): FormGroup {
    const formGroupConfig: any = {
    job_id: [this.careerListForm.value.job_id, Validators.required],
    company_name: [this.careerListForm.value.company_name],  // Adjust validators as needed
    job_title: [this.careerListForm.value.job_title],  // Adjust validators as needed
    experience: [this.careerListForm.value.experience],
    work_location: [this.careerListForm.value.work_location],
    job_description: [this.careerListForm.value.job_description],
    skills: [this.careerListForm.value.skills],
    published: [this.careerListForm.value.published],  // Assuming this is a boolean property
    };
  
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
    const publishedControl = this.careerListForm.get('published');
    if (publishedControl) {
      publishedControl.setValue(!publishedControl.value);
    }
  }
  ngOnDestroy(): void {
    this.editor.destroy();
    this.neweditor.destroy();
  }
}

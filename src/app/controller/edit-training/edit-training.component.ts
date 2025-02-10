import { Component, OnInit,OnDestroy, ViewEncapsulation, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrainingService } from '../../services/training.service';
import { UploadService } from '../../services/upload.service';
import { Location } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl, FormControl, Form } from '@angular/forms';
import { Editor, Toolbar } from 'ngx-editor';
import {
  MAT_DIALOG_DATA, MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { courses_type, sub_type, content_types } from '../../model/course-data-store';

import { forkJoin, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-edit-training',
  templateUrl: './edit-training.component.html',
  styleUrls: ['./edit-training.component.css'],
  animations: [
    trigger('toggleAnimation', [
      state('true', style({ transform: 'translateX(30px)' })), // Adjust the values as needed
      state('false', style({ transform: 'translateX(0)' })),
      transition('* <=> *', animate('0.3s ease-in-out')),
    ]),
  ],
  encapsulation: ViewEncapsulation.None,
})
export class EditTrainingComponent implements OnInit, OnDestroy {
  filedata: any;
  training: any = {};
  editor!: Editor;
  neweditor!: Editor;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  image: string | null = null;
  second_image: string | null = null;
  certificate_image: string | null = null;
  imagePreview: any;
  secondImagePreview: any;
  thirdImagePreview: any;
  trainingForm!: FormGroup;
  AllTrainings: any;
  request_data = {}
  trainingId: string | null = null; // Add a property to store the training ID
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
public courses_type:any = courses_type
public sub_type: any = sub_type
public content_types:any = content_types

  constructor(
    private route: ActivatedRoute,
    private trainingService: TrainingService,
    private uploadService: UploadService,
    private location: Location,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: {itemId: string},
    private _snackBar: MatSnackBar, private dialogRef: MatDialogRef<EditTrainingComponent>,
  ) {}

  fetchAllTrainings(): void {
    this.trainingService.getAllTraining(this.request_data).subscribe((data: any) => {
      this.AllTrainings = data.data;
    });
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

  fileEventsecond(event: any) {
    // Handle the file input change event
    const file = event.target.files[0];
    this.second_image = file;
    
    // Display a preview of the new image
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.secondImagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }


  fileEventThird(event: any) {
    // Handle the file input change event
    const file = event.target.files[0];
    this.certificate_image = file;
    
    // Display a preview of the new image
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.thirdImagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  

  // displayImagePreview(file: File) {
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (event) => {
  //       if (event && event.target) {
  //         this.imagePreview = event.target.result as string;
  //       } else {
  //         console.error('Event or event.target is null.');
  //       }
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }
  onSubmit() {
    const trainingFormGroup = this.createTrainingFormGroup();
    const uploadObservables: Observable<any>[] = [];
  
    const uploadAndSetImage = (image: any, controlName: string) => {
      if (image) {
        const upload$ = this.uploadService.uploadImage(image).pipe(
          switchMap((fileName) => {
            console.log(`${controlName} uploaded successfully: `, fileName);
            trainingFormGroup.controls[controlName].setValue(fileName);
            return of(fileName);
          })
        );
        uploadObservables.push(upload$);
      }
    };
  
    // Only add uploads if images exist
    if (this.second_image) uploadAndSetImage(this.second_image, 'second_image');
    if (this.certificate_image) uploadAndSetImage(this.certificate_image, 'certificate_image');
    if (this.image) uploadAndSetImage(this.image, 'image');
  
    if (uploadObservables.length > 0) {
      // If at least one image exists, wait for uploads to finish
      forkJoin(uploadObservables).subscribe(
        () => {
          this.processTraining(trainingFormGroup);
        },
        (error) => console.error('Image upload failed:', error)
      );
    } else {
      // No images to upload, process immediately
      this.processTraining(trainingFormGroup);
    }
  }
  private processTraining(trainingFormGroup: FormGroup) {
    this.updateArrays(trainingFormGroup);
    console.log('Final training form:', trainingFormGroup.value);
    this.trainingId ? this.updateTraining(trainingFormGroup) : this.createTraining(trainingFormGroup);
  }
  


  updateArrays(formGroup: FormGroup) {
    formGroup.controls['event_details'].setValue(this.trainingForm.value.event_details);
    formGroup.controls['systems_used'].setValue(this.trainingForm.value.systems_used);
    formGroup.controls['additional_details'].setValue(this.trainingForm.value.additional_details);
  }

  createTraining(trainingFormGroup: FormGroup) {
    this.trainingService.createTraining(trainingFormGroup.value).subscribe(
      () => {
        this.successMessage = 'Training was created successfully.';
        this.errorMessage = null;
      },
      (error) => {
        this.errorMessage = 'Failed to create training.';
        this.successMessage = null;
      }
    );
  }

  updateTraining(trainingFormGroup: FormGroup) {
    if (this.trainingId) {
      console.log('last :: ' , trainingFormGroup.value)
      this.trainingService.updateTraining(this.trainingId, trainingFormGroup.value).subscribe(
        () => {
          this.successMessage = 'Training was updated successfully.';
          this.errorMessage = null;
          this.openSnackBar(this.successMessage)
          this.dialogRef.close();
        },
        (error) => {
          this.errorMessage = 'Failed to update training.';
          this.successMessage = null;
          this.openSnackBar(this.errorMessage)
          this.dialogRef.close();
        }
      );
    }
  }

  createTrainingFormGroup(): FormGroup {
    const formGroupConfig: any = {
      title: [this.trainingForm.value.title, Validators.required],
      meta_title: [this.trainingForm.value.meta_title, Validators.required],
      keywords: [this.trainingForm.value.keywords, Validators.required],
      meta_description: [this.trainingForm.value.meta_description, Validators.required],
      courses_type: [this.trainingForm.value.courses_type, Validators.required],
      sub_type: [this.trainingForm.value.sub_type],
      related_trainings : [this.trainingForm.value.related_trainings],
      short_description: [this.trainingForm.value.short_description],
      description: [this.trainingForm.value.description],
      published: [this.trainingForm.value.published],
      featured: [this.trainingForm.value.featured],
      slug : [this.trainingForm.value.slug],
      event_details: [this.trainingForm.value.event_details],
      systems_used: [this.trainingForm.value.systems_used],
      additional_details: [this.trainingForm.value.additional_details]
    };
  
    // Check if image exists and conditionally add the image control
    if (this.image) {
      formGroupConfig['image'] = [''] as any; // Type assertion here
    }

    if (this.second_image) {
      formGroupConfig['second_image'] = [''] as any; // Type assertion here
    }

    if (this.certificate_image) {
      formGroupConfig['certificate_image'] = [''] as any; // Type assertion here
    }
  
    return this.fb.group(formGroupConfig);
  }
  
  

  toggleSwitchPublised() {
    const publishedControl = this.trainingForm.get('published');
    if (publishedControl) {
      publishedControl.setValue(!publishedControl.value);
    }
  }

  toggleSwitchFeatured() {
    const featuredControl = this.trainingForm.get('featured');
    if (featuredControl) {
      featuredControl.setValue(!featuredControl.value);
    }
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.neweditor = new Editor();
    this.initializeForm();
    this.fetchAllTrainings();
    const id = this.data.itemId;
    if (id){
      this.trainingId = id;
      if (this.trainingId) {
        this.getTrainingDetails(this.trainingId);
      }
    }
     
  }

  initializeForm() {
    this.trainingForm = this.fb.group({
      title: ['', Validators.required],
      meta_title: ['', Validators.required],
      keywords: ['', Validators.required],
      meta_description: ['', Validators.required],
      courses_type: ['', Validators.required],
      sub_type: [''],
      short_description: [''],
      description: [''],
      published: [false],
      featured: [false],
      image: [''],
      second_image: [''],
      certificate_image: [''],
      related_trainings: [''],
      slug : ['', Validators.required],
      event_details: this.fb.array([]),
      systems_used: this.fb.array([]),
      additional_details: this.fb.array([])
    });
  }
  
  get eventDetails(): FormArray {
    return this.trainingForm.get('event_details') as FormArray;
  }

  get systemsUsed(): FormArray {
    return this.trainingForm.get('systems_used') as FormArray;
  }

  get additionalDetails(): FormArray {
    return this.trainingForm.get('additional_details') as FormArray;
  }

  addEventDetail() {
    this.eventDetails.push(this.fb.group({
      title: [''],
      detail: [''],
    }));
  }

  removeEventDetail(index: number) {
    this.eventDetails.removeAt(index);
  }

  addSystemUsed() {
    this.systemsUsed.push(this.fb.group({
      title: [''],
      detail: [''],
    }));
  }

  removeSystemUsed(index: number) {
    this.systemsUsed.removeAt(index);
  }

  addAdditionalDetails() {
    this.additionalDetails.push(this.fb.group({
      super_title : [''],
      super_description: [''],
      title: [''],
      detail: [''],
      type_detail: ['']
    }))
  }

  removeAdditionalDetails(index: number) {
    this.additionalDetails.removeAt(index)
  }

  goBack(): void {
    this.location.back();
  }

  getTrainingDetails(trainingId: string) {
    this.trainingService.getTraining(trainingId).subscribe(
      (trainingDetails) => {
        // Populate the static form controls
        this.trainingForm.patchValue({
          title: trainingDetails.title,
          meta_title:trainingDetails.meta_title,
          keywords: trainingDetails.keywords,
          meta_description: trainingDetails.meta_description,
          short_description: trainingDetails.short_description,
          courses_type: trainingDetails.courses_type,
          sub_type: trainingDetails.sub_type,
          description: trainingDetails.description,
          published: trainingDetails.published,
          featured: trainingDetails.featured,
          image: trainingDetails.image,
          related_trainings: trainingDetails.related_trainings,
          second_image: trainingDetails.second_image,
          certificate_image: trainingDetails.certificate_image,
          slug : trainingDetails.slug
        });
  
        // Display the image preview
        this.displayImagePreview(trainingDetails.image, 1);

        this.displayImagePreview(trainingDetails.second_image, 2);
        this.displayImagePreview(trainingDetails.certificate_image, 3);
  
        // Populate the dynamic form controls for event_details
        this.eventDetails.clear(); // Clear existing form controls
  
        for (const event of trainingDetails.event_details) {
          this.addEventDetail(); // Add a new form control
          const lastIndex = this.eventDetails.length - 1;
  
          // Patch the values for the last added form control
          this.eventDetails.at(lastIndex).patchValue({
            title: event.title,
            detail: event.detail,
          });
        }


        // Populate the dynamic form controls for event_details
        this.additionalDetails.clear(); // Clear existing form controls
  
        for (const add_detail of trainingDetails.additional_details) {
          this.addAdditionalDetails(); // Add a new form control
          const lastIndex = this.additionalDetails.length - 1;
  
          // Patch the values for the last added form control
          this.additionalDetails.at(lastIndex).patchValue({
            super_title: add_detail.super_title,
            super_description: add_detail.super_description,
            title: add_detail.title,
            detail: add_detail.detail,
            type_detail: add_detail.type_detail
          });
        }
  
        // Populate the dynamic form controls for systems_used
        this.systemsUsed.clear(); // Clear existing form controls
  
        for (const system of trainingDetails.systems_used) {
          this.addSystemUsed(); // Add a new form control
          const lastIndex = this.systemsUsed.length - 1;
  
          // Patch the values for the last added form control
          this.systemsUsed.at(lastIndex).patchValue({
            title: system.title,
            detail: system.detail,
          });
        }
      },
      (error) => {
        console.error('Failed to fetch training details:', error);
      }
    );
  }
  
  displayImagePreview(imageUrl: string, type: number) {
    if (imageUrl && type === 1) {
      // Set the imagePreview property to the imageUrl
      this.imagePreview = imageUrl;
    }
    else if (imageUrl && type === 2){
      this.secondImagePreview = imageUrl;
    }
    else{
      this.thirdImagePreview = imageUrl
    }
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

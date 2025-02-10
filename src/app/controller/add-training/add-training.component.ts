import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrainingService } from '../../services/training.service';
import { UploadService } from '../../services/upload.service';
import { Location } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { FormArray, FormBuilder, FormGroup, Validators,AbstractControl } from '@angular/forms';
import { Editor, Toolbar } from 'ngx-editor';
import { courses_type, sub_type, content_types } from '../../model/course-data-store';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { TrainingcardViewComponent } from '../../components/training-cardview/training-cardview.component';

import { forkJoin, of, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-add-training',
  templateUrl: './add-training.component.html',
  styleUrls: ['./add-training.component.css'],
  animations: [
    trigger('toggleAnimation', [
      state('true', style({ transform: 'translateX(30px)' })), // Adjust the values as needed
      state('false', style({ transform: 'translateX(0)' })),
      transition('* <=> *', animate('0.3s ease-in-out')),
    ]),
  ],
  
})
export class AddTrainingComponent implements OnInit, OnDestroy {
  filedata:any;
  training: any = {}; // Initialize with an empty object
  editor!: Editor;
  neweditor!: Editor;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  image: string | null = null; // To store the selected image file
  imagePreview : any;
  secondImage: string | null = null;
  thirdImage: string | null = null;
  secondImagePreview: any;
  thirdImagePreview: any;
  AllTrainings: any;
  data = {}
  trainingForm!: FormGroup;
  inputState = 'inactive';
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
  public sub_type:any = sub_type

  public content_types:any = content_types

  onInputFocus() {
    this.inputState = 'active';
  }

  onInputBlur() {
    this.inputState = 'inactive';
  }
  constructor(
    private uploadService: UploadService,
    private _snackBar: MatSnackBar,
    private location: Location,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TrainingcardViewComponent>,
    private trainingService: TrainingService
  ) {}

  fetchAllTrainings(): void {
    this.trainingService.getAllTraining(this.data).subscribe((data: any) => {
      this.AllTrainings = data.data;
      window.scrollTo(0, 0); // Scroll to the top of the page
    });
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.neweditor = new Editor();
    this.initializeForm();
    this.fetchAllTrainings();
  }

  initializeForm() {
    this.trainingForm = this.fb.group({
      title: ['', Validators.required],
      meta_title: ['', Validators.required],
      keywords: ['', Validators.required],
      meta_description: ['', Validators.required],
      short_description: [''],
      courses_type: ['', Validators.required],
      sub_type: [''],
      description: [''],
      published: [false],
      featured: [false],
      slug: ['', Validators.required],
      image: [''],
      second_image: [''],
      cerficate_image: [''],
      related_trainings: [''],
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
      super_title: [''],
      super_description: [''],
      title: [''],
      detail: [''],
      type_detail: ['']
    }));
  }

  removeAdditionalDetails(index: number) {
    this.additionalDetails.removeAt(index);
  }

  goBack(): void {
    this.location.back();
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  ngOnDestroy(): void {
    this.editor.destroy();
    this.neweditor.destroy();
  }

  fileEvent(event: any) {
    const file = event.target.files[0];
    this.image = file;
    this.displayImagePreview(file, 'imagePreview');
  }

  secondFileEvent(event: any) {
    const file = event.target.files[0];
    this.secondImage = file;
    this.displayImagePreview(file, 'secondImagePreview');
  }

  certifcateFileEvent(event: any) {
    const file = event.target.files[0];
    this.thirdImage = file;
    this.displayImagePreview(file, 'thirdImagePreview');
  }


  displayImagePreview(file: File, previewProperty: string) {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        if (event && event.target) {
          (this as any)[previewProperty] = event.target.result as string;
        } else {
          console.error('Event or event.target is null.');
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    const trainingFormGroup = this.createTrainingFormGroup();
    const uploadObservables: Observable<any>[] = [];
  
    const uploadAndSetImage = (image: any, controlName: string) => {
      if (image) {
        const upload$ = this.uploadService.uploadImage(image).pipe(
          switchMap((fileName) => {
            console.log(`${controlName} uploaded successfully:`, fileName);
            trainingFormGroup.controls[controlName].setValue(fileName);
            return of(fileName);
          })
        );
        uploadObservables.push(upload$);
      }
    };
  
    // Upload images if they exist
    uploadAndSetImage(this.image, 'image');
    uploadAndSetImage(this.thirdImage, 'certificate_image');
    uploadAndSetImage(this.secondImage, 'second_image');
  
    if (uploadObservables.length > 0) {
      // Wait for all uploads to complete before processing training
      forkJoin(uploadObservables).subscribe(
        () => {
          this.updateArrays(trainingFormGroup);
          this.createTraining(trainingFormGroup);
        },
        (error) => console.error('Image upload failed:', error)
      );
    } else {
      // No images to upload, proceed immediately
      console.log('No images to upload. Proceeding with form submission.');
      this.updateArrays(trainingFormGroup);
      this.createTraining(trainingFormGroup);
    }
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
        this.openSnackBar(this.successMessage);
        this.dialogRef.close();
      },
      (error) => {
        this.errorMessage = 'Failed to create training.';
        this.successMessage = null;
        this.openSnackBar(this.errorMessage);
        this.dialogRef.close();
      }
    );
  }

  createTrainingFormGroup(): FormGroup {
    return this.fb.group({
      title: [this.trainingForm.value.title, Validators.required],
      meta_title: [this.trainingForm.value.meta_title, Validators.required],
      keywords: [this.trainingForm.value.keywords, Validators.required],
      meta_description: [this.trainingForm.value.meta_description, Validators.required],
      short_description: [this.trainingForm.value.short_description, Validators.required],
      courses_type: [this.trainingForm.value.courses_type, Validators.required],
      sub_type: [this.trainingForm.value.sub_type],
      description: [this.trainingForm.value.description],
      published: [this.trainingForm.value.published],
      featured: [this.trainingForm.value.featured],
      image: [''],
      second_image: [''],
      certificate_image: [''],
      related_trainings: [''],
      slug: [this.trainingForm.value.slug, Validators.required],
      event_details: [this.trainingForm.value.event_details],
      systems_used: [this.trainingForm.value.systems_used],
      additional_details: [this.trainingForm.value.additional_details]
    });
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

}
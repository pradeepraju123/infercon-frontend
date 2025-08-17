import { Component, OnInit,OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UploadService } from '../../services/upload.service';
import { Location } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { Editor, Toolbar } from 'ngx-editor';
import {
  MAT_DIALOG_DATA, MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { countries } from '../../model/country-data-store';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-edit-contact',
  templateUrl: './edit-contact.component.html',
  styleUrl: './edit-contact.component.css'
})
export class EditContactComponent implements OnInit, OnDestroy  {
  filedata: any;
  training: any = {};
  editor!: Editor;
  neweditor!: Editor;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  image: string | null = null;
  imagePreview: any;
  editForm!: FormGroup;
  contactId: string | null = null; // Add a property to store the training ID
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
   isCreateMode: boolean = false;
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
  public countries:any = countries
  public sources = ['Facebook', 'Linkedin', 'Website', 'Direct Enquiry', 'Reference'];
  constructor(
    private contactService: ContactService,
    private location: Location,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: {itemId: string},
    private _snackBar: MatSnackBar, private dialogRef: MatDialogRef<EditContactComponent>,
  ) {
    this.editForm = this.fb.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      city: [''],
      state: [''],
      country: [''],
       courses: this.fb.array([]),
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

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.image = file;
    }
  }

  onSubmit() {
    const contactFormGroup = this.createContactFormGroup();
  
      // Do not update the image parameter if no image is selected
      // this.updateArrays(contactFormGroup);
      if (this.contactId) {
        this.updateContact(contactFormGroup);
      }
  }

  updateContact(contactFormGroup: FormGroup) {
    if (this.contactId) {
          console.log('Update payload:', contactFormGroup.value); 
      this.contactService.updateContact(this.contactId, contactFormGroup.value).subscribe(
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

  toggleSwitch() {
    const publishedControl = this.editForm.get('published');
    if (publishedControl) {
      publishedControl.setValue(!publishedControl.value);
    }
  }

createContactFormGroup(): FormGroup {
  return this.fb.group({
    fullname: [this.editForm.value.fullname, Validators.required],
    email: [this.editForm.value.email, [Validators.required, Validators.email]],
    phone: [this.editForm.value.phone, Validators.required],
    city: [this.editForm.value.city],
    state: [this.editForm.value.state],
    country: [this.editForm.value.country],
    message: [this.editForm.value.message],
    source: [this.editForm.value.source],
    courses: this.fb.array(this.editForm.value.courses || []),
    location: this.fb.array(this.editForm.value.location || []),
    languages: this.fb.array(this.editForm.value.languages || []),
    comments: this.fb.array(
      (this.editForm.value.comments || []).map((comment: any) => 
        this.fb.group({
          texts: [comment.texts],
          createdAt: [comment.createdAt],
          _id: [comment._id]
        })
      )
    )
  });
}

  ngOnInit(): void {
    this.editor = new Editor();
    this.neweditor = new Editor();
    this.initializeForm();
    const id = this.data.itemId;
    if (id){
      this.contactId = id;
      if (this.contactId) {
        console.log(this.contactId)
        this.getContactDetails(this.contactId);
      }
    }
     
  }

  initializeForm() {
  this.editForm = this.fb.group({
    fullname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    city: [''],
    state: [''],
    country: [''],
    courses: this.fb.array([]),
    message: [''],
    source: [''],
    location: this.fb.array([]),
    languages: this.fb.array([]),
    comments: this.fb.array([])
   
  });
}
  goBack(): void {
    this.location.back();
  }

  getContactDetails(contactId: string) {
    this.contactService.getContactById(contactId).subscribe(
      (contactDetails) => {
        // Populate the static form controls
        this.editForm.patchValue({
        fullname: contactDetails.data.fullname,
        email: contactDetails.data.email,
        phone: contactDetails.data.phone,
        city: contactDetails.data.city,
        state: contactDetails.data.state,
        country: contactDetails.data.country,
        message: contactDetails.data.message,
        source: contactDetails.data.source,
        
      });

      this.initFormArray('courses', contactDetails.data.courses);
      this.initFormArray('location', contactDetails.data.location);
      this.initFormArray('languages', contactDetails.data.languages);
      
      // Handle comments specially
      const commentsArray = this.editForm.get('comments') as FormArray;
      commentsArray.clear();
      if (contactDetails.data.comments && contactDetails.data.comments.length > 0) {
        contactDetails.data.comments.forEach((comment: any) => {
          commentsArray.push(this.fb.group({
            texts: [comment.texts],
            createdAt: [comment.createdAt],
            _id: [comment._id]
          }));
        });
      }
    },
    (error) => {
      console.error('Failed to fetch contact details:', error);
    }
  );
}

// Helper method for initializing form arrays
private initFormArray(controlName: string, sourceArray: any[]) {
  const formArray = this.editForm.get(controlName) as FormArray;
  formArray.clear();
  if (sourceArray && sourceArray.length > 0) {
    sourceArray.forEach(item => {
      formArray.push(this.fb.control(item));
    });
  }
}

// Add getters for template access
get locationControls() {
  return (this.editForm.get('location') as FormArray).controls;
}

get languagesControls() {
  return (this.editForm.get('languages') as FormArray).controls;
}

get commentsControls() {
  return (this.editForm.get('comments') as FormArray).controls;
}
  
  displayImagePreview(imageUrl: string) {
    if (imageUrl) {
      // Set the imagePreview property to the imageUrl
      this.imagePreview = imageUrl;
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

  addLanguage() {
  const languages = this.editForm.get('languages') as FormArray;
  languages.push(this.fb.control(''));
}

removeLanguage(index: number) {
  const languages = this.editForm.get('languages') as FormArray;
  languages.removeAt(index);
}

addLocation() {
  const locations = this.editForm.get('location') as FormArray;
  locations.push(this.fb.control(''));
}

removeLocation(index: number) {
  const locations = this.editForm.get('location') as FormArray;
  locations.removeAt(index);
}

addComment() {
  const comments = this.editForm.get('comments') as FormArray;
  comments.push(this.fb.group({
    texts: [''],
    createdAt: [new Date()]
  }));
}

removeComment(index: number) {
  const comments = this.editForm.get('comments') as FormArray;
  comments.removeAt(index);
}
get coursesControls() {
  return (this.editForm.get('courses') as FormArray).controls;
}

addCourse() {
  const courses = this.editForm.get('courses') as FormArray;
  courses.push(this.fb.control('')); // Add a new empty course
}

removeCourse(index: number) {
  const courses = this.editForm.get('courses') as FormArray;
  courses.removeAt(index); // Remove the course at the given index
}
}
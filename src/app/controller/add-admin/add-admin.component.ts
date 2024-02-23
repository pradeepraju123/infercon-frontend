import { Component, OnInit,OnDestroy,ViewEncapsulation, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {
  MAT_DIALOG_DATA, MatDialogRef,
} from '@angular/material/dialog';
import { Editor, Toolbar } from 'ngx-editor';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
@Component({
  selector: 'app-add-admin',
  templateUrl: './add-admin.component.html',
  styleUrl: './add-admin.component.css',
  animations: [
    trigger('toggleAnimation', [
      state('true', style({ transform: 'translateX(30px)' })), // Adjust the values as needed
      state('false', style({ transform: 'translateX(0)' })),
      transition('* <=> *', animate('0.3s ease-in-out')),
    ]),
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AddAdminComponent implements OnInit{
  filedata:any;
  generaldata: any = {}; // Initialize with an empty object
  editor!: Editor;
  neweditor!: Editor;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  image: string | null = null; // To store the selected image file
  imagePreview : any;
  userForm!: FormGroup
  userId: string | null = null; // Add a property to store the training ID
  contentLoaded: boolean | null = null;
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
    private userService: UserService,
    private location : Location, 
    @Inject(MAT_DIALOG_DATA) public data: {itemId: string},
    private _snackBar: MatSnackBar, 
    private dialogRef: MatDialogRef<AddAdminComponent>, 
    private fb: FormBuilder) {}
  ngOnInit(): void {
    this.initializeForm();
    if (this.data){
      console.log('it comes here')
      this.contentLoaded = false
      const id = this.data.itemId;
      if (id){
        this.userId = id;
        if (this.userId) {
          console.log(this.userId)
          this.getAdmin(this.userId);
        }
      }
    }else{
      this.contentLoaded = true
    }
    
     
  }

  onSubmit() {
    const userFormGroup = this.createUserFormGroup();
    if (this.userId){
      this.updateUserFunc(userFormGroup); // Update the user without an image
      
    }else {
      this.createUser(userFormGroup)
      this.contentLoaded = true
    }
      
  }
  initializeForm() {
    this.userForm = this.fb.group({
      name: [''],
      username: [''],
      email: [''],
      phone_number: [''],
      password: [''],
      userType: [''],
      active: ['']
    });
  }
  updateUserFunc(generalFormGroup: FormGroup) {
    if (this.userId) {
      this.userService.updateUser(this.userId, generalFormGroup.value).subscribe(
        () => {
          this.successMessage = 'User was updated successfully.';
          this.errorMessage = null;
          this.openSnackBar(this.successMessage)
          this.dialogRef.close();
        },
        (error) => {
          this.errorMessage = 'Failed to update User.';
          this.successMessage = null;
          this.openSnackBar(this.errorMessage)
          this.dialogRef.close();
        }
      );
    }
  }

  getAdmin(userId: string) {
    this.userService.getUserById(userId).subscribe(
      (userDetails) => {
        // Populate the static form controls
        this.userForm.patchValue({
          name: userDetails.data.name,
          username: userDetails.data.username,
          email: userDetails.data.email,
          phone_number: userDetails.data.phone_number,
          userType: userDetails.data.userType,
          active: userDetails.data.active
        });
        console.log(userDetails.data)
      },
      (error) => {
        console.error('Failed to fetch User details:', error);
      }
    );
  }
  createUserFormGroup(): FormGroup {
    const formGroupConfig: any = {
      name: [this.userForm.value.name],
      username: [this.userForm.value.username],
      email: [this.userForm.value.email],
      password: [this.userForm.value.password],
      phone_number: [this.userForm.value.phone_number],
      userType: [this.userForm.value.userType]
    };
    return this.fb.group(formGroupConfig);
  }

  createUser(userFormGroup: FormGroup) {
    this.userService.addUser(userFormGroup.value).subscribe(
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
    const publishedControl = this.userForm.get('active');
    if (publishedControl) {
      publishedControl.setValue(!publishedControl.value);
    }
  }
}

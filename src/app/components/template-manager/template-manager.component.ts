import { Component, OnInit } from '@angular/core';
import { TemplateService, Template } from '../../services/templates/template.service';
import { MatPaginator } from '@angular/material/paginator';

import {
  MatDialog,
} from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatSort, Sort } from '@angular/material/sort';
import { FormGroup, FormControl,Validators } from '@angular/forms';



@Component({
  selector: 'app-template-manager',
  templateUrl: './template-manager.component.html',
  styleUrls: ['./template-manager.component.css']
})
export class TemplateManagerComponent implements OnInit {
  templates: Template[] = [];
  newTemplate: Template = { id: '', course_content: [''], imageUrl: '' };
  editId: string | null = null;
  selectedImage: File | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  imageError: string | null = null;


  
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  constructor(private service: TemplateService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,) {}

  ngOnInit(): void {
    this.service.getAll().subscribe({
      next: (data) => {
        this.templates = data;
      },
      error: (err) => {
        console.error('Failed to load templates:', err);
      }
    });
    this.loadTemplates();
  }

  onImageSelected(event: any): void {
    const file: File = event.target.files[0];
  
    if (!file) return;
  
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
  
    img.onload = () => {
      if (img.width === 470 && img.height === 705) {
        this.selectedImage = file;
        // clear any previous error
        this.imageError = null;
      } else {
        this.selectedImage = null;
        this.errorMessage = 'Image must be exactly 470x705 pixels.';
        this.openSnackBar(this.errorMessage);
      }
      URL.revokeObjectURL(objectUrl);
    };
  
    img.onerror = () => {
      this.selectedImage = null;
      this.errorMessage = 'Invalid image file.';
        this.openSnackBar(this.errorMessage);
      URL.revokeObjectURL(objectUrl);
    };
  
    img.src = objectUrl;
  }
  

  loadTemplates(): void {
    this.service.getAll().subscribe({
      next: (data) => this.templates = data,
      error: (err) => console.error('Failed to load templates:', err)
    });
  }

  addCourseItem(): void {
    this.newTemplate.course_content.push('');
  }

  removeCourseItem(index: number): void {
    if (this.newTemplate.course_content.length > 1) {
      this.newTemplate.course_content.splice(index, 1);
    }
  }

  saveTemplate(): void {
    const cleanContent = this.newTemplate.course_content.filter(item => item.trim() !== '');
    if (!this.newTemplate.id || cleanContent.length === 0) {
      this.errorMessage = 'Please enter template ID and at least one course content item.';
      this.openSnackBar(this.errorMessage)
      return;
    }

    this.newTemplate.course_content = cleanContent;

    // Prepare FormData for sending text + image
    const formData = new FormData();
    formData.append('id', this.newTemplate.id);
    formData.append('course_content', JSON.stringify(this.newTemplate.course_content));
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    if (this.editId) {
      this.service.update(this.editId, formData).subscribe({
        next: () => {
          this.resetForm();
          this.loadTemplates();
        },
        error: (err) => console.error('Update failed:', err)
      });
    } else {
      this.service.create(formData).subscribe({
        next: () => {
          this.resetForm();
          this.loadTemplates();
        },
        error: (err) => console.error('Create failed:', err)
      });
    }
  }

  editTemplate(template: Template): void {
    this.newTemplate = { ...template, course_content: [...template.course_content] };
    this.editId = template.id;
    this.selectedImage = null; // Reset selected image on edit
  }

  deleteTemplate(id: string): void {
    if (confirm('Are you sure you want to delete this template?')) {
      this.service.delete(id).subscribe({
        next: () => this.loadTemplates(),
        error: (err) => console.error('Delete failed:', err)
      });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', 
    {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  private resetForm(): void {
    this.newTemplate = { id: '', course_content: [''], imageUrl: '' };
    this.editId = null;
    this.selectedImage = null;
  }
}

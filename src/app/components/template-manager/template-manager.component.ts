import { Component, OnInit } from '@angular/core';
import { TemplateService, Template } from '../../services/templates/template.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-template-manager',
  templateUrl: './template-manager.component.html',
  styleUrls: ['./template-manager.component.css']
})
export class TemplateManagerComponent implements OnInit {
  templates: Template[] = [];
  newTemplate: Template = {
    course_id: '',
    course_content: [''],
    imageUrl: '',
    template_title_first: '',
    template_title_second: '',
    template_title_third: ''
  };
  editId: string | null = null;
  selectedImage: File | null = null;
  imagePreviewUrl: string | null = null;

  constructor(private service: TemplateService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.service.getAll().subscribe({
      next: (data) => (this.templates = data),
      error: (err) => console.error('Failed to load templates:', err),
    });
  }

  addCourseItem(): void {
    if (!Array.isArray(this.newTemplate.course_content)) {
      this.newTemplate.course_content = [];
    }
    this.newTemplate.course_content.push('');
  }

  removeCourseItem(index: number): void {
    if (this.newTemplate.course_content.length > 1) {
      this.newTemplate.course_content.splice(index, 1);
    }
  }

  onImageSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      // Optional: Validate image dimensions here
      this.selectedImage = file;
      this.imagePreviewUrl = objectUrl;
    };

    img.src = objectUrl;
  }

  saveTemplate(): void {
    const cleanContent = this.newTemplate.course_content.filter(item => item.trim() !== '');
    if (cleanContent.length === 0) {
      this.openSnackBar('Please enter all fields.');
      return;
    }
    

    const isDuplicate = this.templates.some(t => t.course_id === this.newTemplate.course_id);
    if (!this.editId && isDuplicate) {
      this.openSnackBar('Template ID already exists.');
      return;
    }

    const formData = new FormData();
    formData.append('course_id', this.newTemplate.course_id);
    formData.append('template_title_first', this.newTemplate.template_title_first);
    formData.append('template_title_second', this.newTemplate.template_title_second);
    formData.append('template_title_third', this.newTemplate.template_title_third);
    formData.append('course_content', JSON.stringify(cleanContent));
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }
//     console.log('FormData contents:');
// formData.forEach((value, key) => {
//   console.log(`${key}:`, value);
// });

//     console.log(formData);
//alert(formData);
    const request = this.editId
      ? this.service.update(this.editId, formData)
      : this.service.create(formData);

    request.subscribe({
      next: () => {
        this.resetForm();
        this.loadTemplates();
        this.openSnackBar(this.editId ? 'Template updated successfully' : 'Template created successfully');
      },
      error: () => this.openSnackBar(this.editId ? 'Update failed' : 'Create failed')
    });
  }

  editTemplate(template: Template): void {
    this.newTemplate = {
      course_id: template.course_id,
      course_content: [...template.course_content],
      imageUrl: template.imageUrl,
      template_title_first: template.template_title_first,
      template_title_second: template.template_title_second,
      template_title_third: template.template_title_third
    };
    this.editId = template.course_id;
    this.imagePreviewUrl = template.imageUrl || null;
    this.selectedImage = null;
  }

  deleteTemplate(course_id: string): void {
    if (confirm('Are you sure?')) {
      this.service.delete(course_id).subscribe({
        next: () => {
          this.loadTemplates();
          this.openSnackBar('Deleted successfully');
        },
        error: () => this.openSnackBar('Delete failed')
      });
    }
  }

  resetForm(): void {
    this.newTemplate = {
      course_id: '',
      course_content: [''],
      imageUrl: '',
      template_title_first: '',
      template_title_second: '',
      template_title_third: ''
    };
    this.editId = null;
    this.selectedImage = null;
    this.imagePreviewUrl = null;
  }

  trackByIndex(index: number): any {
    return index;
  }

  openSnackBar(msg: string): void {
    this.snackBar.open(msg, 'Close', { duration: 3000 });
  }
}

// src/app/components/whatsapp-activity/whatsapp-activity.component.ts

import { Component, ViewChild, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

import { WhatsappActivityService } from '../../services/whatsapp-activity.service';
import { ContactService } from '../../services/contact.service';
import { TemplateService, Template } from '../../services/templates/template.service';

@Component({
  selector: 'app-whatsapp-activity',
  templateUrl: './whatsapp-activity.component.html',
  styleUrls: ['./whatsapp-activity.component.css']
})
export class WhatsappActivityComponent implements OnInit {
  filterForm!: FormGroup;
  templates: Template[] = [];
  selectedCourseId: string = '';
  selectedFile: File | null = null;
  fileError: string | null = null;

  displayedColumns: string[] = ['select', 'fullname', 'phone_number'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(
    private fb: FormBuilder,
    private whatsappActivityService: WhatsappActivityService,
    private contactService: ContactService,
    private service: TemplateService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    this.service.getAll().subscribe({
      next: (data) => {
        this.templates = data;
      },
      error: (err) => {
        console.error('Failed to load templates:', err);
      }
    });
  }

  initializeForm() {
    this.filterForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      country: [''],
      experience: [''],
      course: [''],
      course_id: ['', Validators.required]
    });
  }

  submitForm() {
    if (this.filterForm.invalid) return;

    this.whatsappActivityService.sendmessage_filtercontact(this.filterForm.value).subscribe({
      next: (response: any) => {
        this.dataSource.data = response.contacts || [];
        this.selection.clear();
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.openSnackBar('Contacts loaded successfully');
      },
      error: () => {
        this.openSnackBar('Error loading contacts');
      }
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  sendToWhatsApp() {
    const selectedContacts = this.selection.selected;
    const mobileNumbers = selectedContacts.map(c => c.phone_number);

    const courseId = this.selectedCourseId || this.filterForm.value.course_id;
    alert(mobileNumbers);
    alert(courseId);

    if (!courseId || mobileNumbers.length === 0) {
      alert('Please select contacts and a template.');
      return;
    }

    this.whatsappActivityService.sendcontect_template({
      mobileNumbers,
      course_id: courseId
    }).subscribe(
      () => {
        this.openSnackBar('Message sent successfully.');
      },
      () => {
        this.openSnackBar('Error sending message.');
      }
    );
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension !== 'xls' && extension !== 'xlsx') {
        this.fileError = 'Only Excel files (.xls, .xlsx) are allowed!';
        return;
      }
      this.fileError = null;
      this.selectedFile = file;
    }
  }

  uploadFile() {
    if (!this.selectedFile) {
      this.fileError = "Please select a file first!";
      return;
    }

    const formData = new FormData();
    formData.append("file", this.selectedFile);

    this.whatsappActivityService.uploaduser(formData).subscribe(
      () => {
        this.openSnackBar('File uploaded successfully.');
      },
      () => {
        this.fileError = 'Error uploading file. Please try again.';
        this.openSnackBar(this.fileError);
      }
    );
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 3000
    });
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }
}

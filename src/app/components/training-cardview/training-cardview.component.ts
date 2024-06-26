import { Component, ViewEncapsulation } from '@angular/core';
import { TrainingService } from '../../services/training.service';
import { MatDialog } from '@angular/material/dialog';
import { EditTrainingComponent } from '../../controller/edit-training/edit-training.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-trainingcard-view',
  templateUrl: './training-cardview.component.html',
  styleUrls: ['./training-cardview.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class TrainingcardViewComponent {

  contentLoaded = false;
  trainings: any[] = []; // Define a property to store the fetched data
  filteredTrainings: any[] = []; // Add a property to store filtered data
  searchTerm: string = '';
  startDate: any;
  endDate: any;
  published: any;
  sortBy: any
  pageSize: number = 10;
  pageNum: number = 1;
  data : any
  constructor(private trainingService: TrainingService,public dialog: MatDialog, public snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.fetchAllTrainings();
  }
  deleteTraining(serviceId: string) {
    this.trainingService.deleteTraining(serviceId).subscribe(() => {
      this.trainings = this.trainings.filter(blog => blog.id !== serviceId); // Assuming blog has an id property
      this.snackBar.open('Blog deleted successfully', 'Close', {
        duration: 3000,
      });
    }, (error) => {
      console.error('Error deleting blog: ', error);
      this.snackBar.open('Failed to delete blog', 'Close', {
        duration: 3000,
      });
    });
  }
  fetchAllTrainings(): void {
    this.trainingService.getAllTraining(this.data).subscribe((data: any) => {
      this.trainings = data.data;
      this.filteredTrainings = this.trainings; // Initialize filteredTrainings with all trainings
      this.contentLoaded = true;
    });
  }

  search(): void {
    const param = {
      searchTerm: this.searchTerm,
      start_date: this.formatDate(this.startDate),
      end_date: this.formatDate(this.endDate),
      published: this.published,
      sort_by: this.sortBy,
      page_size: this.pageSize,
      page_num: this.pageNum
    };
  
    this.trainingService.getAllTraining(param).subscribe(
      (responseData: any) => {
        this.filteredTrainings = responseData.data; // Assuming 'data' is the property containing the results
      },
      error => {
        console.error('Error:', error);
        // Handle error if needed
      }
    );
  }
  openDialog(_id: String) {
    this.dialog.open(EditTrainingComponent, {
      data: {
        itemId: _id,
      }
    });
  }
  
  private formatDate(date: string): string {
    return new Date(date).toISOString();
  }
  
}


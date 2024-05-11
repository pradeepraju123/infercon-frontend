import { Component, OnInit } from '@angular/core';
import { TrainingService } from '../../services/training.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-training-list',
  templateUrl: './training-list.component.html',
  styleUrl: './training-list.component.css'
})
export class TrainingListComponent implements OnInit {
  showText: boolean = false;
  trainings: any[]=[]; // Define a property to store the fetched data
  contentLoaded: boolean = false;
  corporateTraining: boolean = false;
  individualTraining: boolean = false;
  academicTraining: boolean = false;
  data = {}
  constructor(private trainingService: TrainingService, public route: ActivatedRoute) { };

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('id');
      console.log('slug :: ', slug);
      if (slug) {
        console.log('slug :: ',slug);
        // Assuming 'slug' contains the type information, you can filter trainings based on it
        this.fetchTrainingsByType(slug);
      } else {
        console.log('it comes here')
        // If there's no slug, fetch all trainings
        this.fetchAllTrainings();
      }
    });
    window.scrollTo(0,0);
  }
  fetchTrainingsByType(courses_type: string): void {
    this.trainingService.getAllTraining(this.data).subscribe((data: any) => {
      // Filter trainings based on type
      this.trainings = data.data.filter((item: any) => item.courses_type === courses_type);
      console.log('Trainings :: ', this.trainings)
      this.contentLoaded = true;
      if (courses_type === 'corporate_training'){
        this.corporateTraining = true;
      }
      if (courses_type ==='individual_training'){
        this.individualTraining = true;
      }
      if (courses_type ==='academic_training'){
        this.academicTraining = true
      }
      
      window.scrollTo(0, 0); // Scroll to the top of the page
    });
  }
  
  fetchAllTrainings(): void {
    this.trainingService.getAllTraining(this.data).subscribe((data: any) => {
      this.trainings = data.data;
      this.contentLoaded = true;
      window.scrollTo(0, 0); // Scroll to the top of the page
    });
  }
  
  
}

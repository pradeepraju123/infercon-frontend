import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrainingService } from '../../services/training.service';
import { MetaService } from '../../services/meta.service';
import { Router, NavigationEnd } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { BookingComponent } from '../../components/booking/booking.component';
import { DataService } from '../../services/data-service.service';

@Component({
  selector: 'app-training-detail',
  templateUrl: './training-detail.component.html',
  styleUrls: ['./training-detail.component.css']
})
export class TrainingDetailComponent implements OnInit {
  training: any;
  groupedDetails: { super_title: string, details: any[] }[] = []; // Initialize groupedDetails with a specific type
  formattedData: Record<string, any> = {};
  related_trainings: any[] = [];
  trainingDetailsList: any[] = [];
  searchTerm: string = '';
  startDate: any = null;
  endDate: any = new Date();
  published: any;
  sortBy: any
  pageSize = 10;
  pageNum = 1;
  constructor(
    private route: ActivatedRoute,
    private trainingService: TrainingService,
    private metaService: MetaService,
    public dialog: MatDialog,
    public dataService: DataService
  ) {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('id');
      console.log(slug)
      if (slug) {
        this.trainingService.getTrainingBySlug(slug).subscribe(
          (data) => {
            this.training = data.data;
            this.formattedData = this.dataService.formatData(this.training.additional_details);
            console.log('formatted data ',this.formattedData)
            const params = {
              training_ids: this.training.related_trainings
            };
            this.trainingService.getTrainingByPublished(params).subscribe(trainingDetails => {
              console.log('related trainings : ', trainingDetails.data)
              this.trainingDetailsList = trainingDetails.data;
              },
              (error) => {
                console.error('Error fetching contact data:', error);
              }
            );

            // this.groupedDetails = this.groupByTitle(this.training.additional_details);
            // Update meta tags dynamically
            this.metaService.updateMetaTags(
              this.training.meta_title,
              this.training.meta_description,
              this.training.keywords
            );
            window.scrollTo(0, 0); // Scroll to the top of the page
          },
          (error) => {
            console.error('Error fetching training details:', error);
          }
        );
      }
    });
  }

  groupByTitle(details: any[]): { super_title: string, details: any[] }[] {
    const groups: { [super_title: string]: any[] } = {}; // Specify the type of groups object
    details.forEach(detail => {
      const super_title = detail.super_title;
      if (!groups[super_title]) {
        groups[super_title] = [];
      }
      groups[super_title].push(detail);
    });
    return Object.keys(groups).map(super_title => ({ super_title, details: groups[super_title] }));
  }
  openDialog() {
    this.dialog.open(BookingComponent);
  }
  ngOnInit(): void {
    this.related_trainings = [];
    // this.loadRelatedTrainings();
    window.scrollTo(0, 0); // Scroll to the top of the page
  }
  private formatDate(date: string): string {
    return new Date(date).toISOString();
  }
}

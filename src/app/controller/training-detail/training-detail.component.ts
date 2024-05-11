import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrainingService } from '../../services/training.service';
import { MetaService } from '../../services/meta.service';
import { Router, NavigationEnd } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { BookingComponent } from '../../components/booking/booking.component';

@Component({
  selector: 'app-training-detail',
  templateUrl: './training-detail.component.html',
  styleUrls: ['./training-detail.component.css']
})
export class TrainingDetailComponent {
  training: any;
  groupedDetails: { super_title: string, details: any[] }[] = []; // Initialize groupedDetails with a specific type

  constructor(
    private route: ActivatedRoute,
    private trainingService: TrainingService,
    private metaService: MetaService,
    public dialog: MatDialog
  ) {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('id');
      if (slug) {
        this.trainingService.getTrainingBySlug(slug).subscribe(
          (data) => {
            this.training = data.data;
            this.groupedDetails = this.groupByTitle(this.training.additional_details);
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
}

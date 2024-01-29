import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrainingService } from '../../services/training.service';
import { MetaService } from '../../services/meta.service';
import { Router, NavigationEnd } from '@angular/router';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-training-detail',
  templateUrl: './training-detail.component.html',
  styleUrls: ['./training-detail.component.css']
})
export class TrainingDetailComponent {
  training: any;

  constructor(private route: ActivatedRoute, private trainingService: TrainingService, public metaService: MetaService,
    private router: Router, private viewportScroller: ViewportScroller) {}

  ngOnInit(): void {
   
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('id');
      console.log('slug', slug)
      if (slug) {
        console.log(slug)
        this.trainingService.getTrainingBySlug(slug).subscribe(
          (data) => {
            this.training = data.data; // Assuming your API response has a 'data' property
             // Update meta tags dynamically
             this.metaService.updateMetaTags(
              this.training.meta_title,
              this.training.meta_description,
              this.training.keywords
            );
          },
          (error) => {
            console.error('Error fetching training details:', error);
          }
        );
      }
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Scroll to the top of the page
        this.viewportScroller.scrollToPosition([0, 0]);
      }
    });
  }
}

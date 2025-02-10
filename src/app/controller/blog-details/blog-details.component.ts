import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UploadService } from '../../services/upload.service';
import { Location } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { BlogService } from '../../services/blog.service';
import { TrainingService } from '../../services/training.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.css']
})
export class BlogDetailsComponent implements OnInit {
  blogdata: any[]=[]; // Define a property to store the fetched data
  contentLoaded: boolean = false;
  featuredTraining: any[] = [];
  constructor(private route: ActivatedRoute,
              private router: Router,
              private blogService: BlogService,  
              private uploadService : UploadService, 
              private location : Location, 
              private trainingService: TrainingService) { };

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id']; // Get the route parameter as a string
      if (id) {
        this.blogService.getBlogdetail(id).subscribe(
          (blogdata) => {
            this.trainingService.getTrainingByFeatured().subscribe(
              (trainingdata) => {
                this.featuredTraining = trainingdata.data
                console.log(this.featuredTraining)
              }
            )
            this.blogdata = blogdata;
            this.contentLoaded = true;
            window.scrollTo(0, 0);
          },
          (error) => {
            // Handle the case where fetching the training data fails
          }
        );
      } else {
        // Handle the case where the `_id` is not prov_ided or is an empty string
      }
    });
  }
  navigateToForm(trainingSlug: string) {
    this.router.navigate([`/app-training-detail/${trainingSlug}`]).then(() => {
      window.location.href = `/app-training-detail/${trainingSlug}/#form_contact`; // Forces the correct format
    });
  }
}

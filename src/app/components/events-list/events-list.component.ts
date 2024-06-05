import { Component } from '@angular/core';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-events-list',
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.css'
})
export class EventsListComponent {
  blogdata: any[]=[]; // Define a property to store the fetched data
  contentLoaded: boolean = false;
  limit: number = 20; // Set your desired limit here
  type: string = 'events'
  constructor(private blogService: BlogService) { };

  ngOnInit(): void {
    const param = {
      limit: this.limit,
      type: this.type
    }
    this.blogService.getAllblogstest(param).subscribe((responseData: any) => {
      this.blogdata = responseData.data;
      this.contentLoaded = true;
    });
    window.scrollTo(0,0);
  }
}

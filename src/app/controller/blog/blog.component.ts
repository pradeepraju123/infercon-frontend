import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {
  blogdata: any[]=[]; // Define a property to store the fetched data
  contentLoaded: boolean = false;
  limit: number = 20; // Set your desired limit here
  type: string = 'blog'
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

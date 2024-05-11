import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit {
  ngOnInit(): void {
    window.scrollTo(0, 0); // Scroll to the top of the page
  }
}

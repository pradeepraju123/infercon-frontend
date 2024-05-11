import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-training-landing',
  templateUrl: './training-landing.component.html',
  styleUrl: './training-landing.component.css'
})
export class TrainingLandingComponent implements OnInit {
  ngOnInit(): void {
    window.scrollTo(0, 0); // Scroll to the top of the page
  }
}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingLandingComponent } from './training-landing.component';

describe('TrainingLandingComponent', () => {
  let component: TrainingLandingComponent;
  let fixture: ComponentFixture<TrainingLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TrainingLandingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrainingLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

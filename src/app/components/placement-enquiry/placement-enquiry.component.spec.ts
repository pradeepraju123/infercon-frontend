import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacementEnquiryComponent } from './placement-enquiry.component';

describe('PlacementEnquiryComponent', () => {
  let component: PlacementEnquiryComponent;
  let fixture: ComponentFixture<PlacementEnquiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlacementEnquiryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlacementEnquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

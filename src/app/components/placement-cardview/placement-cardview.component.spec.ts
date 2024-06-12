import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacementCardviewComponent } from './placement-cardview.component';

describe('PlacementCardviewComponent', () => {
  let component: PlacementCardviewComponent;
  let fixture: ComponentFixture<PlacementCardviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlacementCardviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlacementCardviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

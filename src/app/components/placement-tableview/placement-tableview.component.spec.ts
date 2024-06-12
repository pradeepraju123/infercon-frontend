import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacementTableviewComponent } from './placement-tableview.component';

describe('PlacementTableviewComponent', () => {
  let component: PlacementTableviewComponent;
  let fixture: ComponentFixture<PlacementTableviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlacementTableviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlacementTableviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

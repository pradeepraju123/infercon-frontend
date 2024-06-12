import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacementListComponent } from './placement-list.component';

describe('PlacementListComponent', () => {
  let component: PlacementListComponent;
  let fixture: ComponentFixture<PlacementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlacementListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlacementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPlacementComponent } from './add-placement.component';

describe('AddPlacementComponent', () => {
  let component: AddPlacementComponent;
  let fixture: ComponentFixture<AddPlacementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddPlacementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddPlacementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPlacementComponent } from './edit-placement.component';

describe('EditPlacementComponent', () => {
  let component: EditPlacementComponent;
  let fixture: ComponentFixture<EditPlacementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditPlacementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditPlacementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

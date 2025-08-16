import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRegisteredDialogComponent } from './create-registered-dialog.component';

describe('CreateRegisteredDialogComponent', () => {
  let component: CreateRegisteredDialogComponent;
  let fixture: ComponentFixture<CreateRegisteredDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateRegisteredDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateRegisteredDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

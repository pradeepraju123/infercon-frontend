import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallmentPopupComponent } from './installment-popup.component';

describe('InstallmentPopupComponent', () => {
  let component: InstallmentPopupComponent;
  let fixture: ComponentFixture<InstallmentPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstallmentPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InstallmentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

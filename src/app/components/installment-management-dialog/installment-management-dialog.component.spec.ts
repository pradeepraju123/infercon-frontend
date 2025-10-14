import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallmentManagementDialogComponent } from './installment-management-dialog.component';

describe('InstallmentManagementDialogComponent', () => {
  let component: InstallmentManagementDialogComponent;
  let fixture: ComponentFixture<InstallmentManagementDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstallmentManagementDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InstallmentManagementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateManagerComponent } from './template-manager.component';

describe('TemplateManagerComponent', () => {
  let component: TemplateManagerComponent;
  let fixture: ComponentFixture<TemplateManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TemplateManagerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TemplateManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

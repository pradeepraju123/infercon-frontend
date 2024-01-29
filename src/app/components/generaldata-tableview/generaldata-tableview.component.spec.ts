import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneraldataTableviewComponent } from './generaldata-tableview.component';

describe('GeneraldataTableviewComponent', () => {
  let component: GeneraldataTableviewComponent;
  let fixture: ComponentFixture<GeneraldataTableviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeneraldataTableviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GeneraldataTableviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

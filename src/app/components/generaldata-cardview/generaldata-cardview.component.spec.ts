import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneraldataCardviewComponent } from './generaldata-cardview.component';

describe('GeneraldataCardviewComponent', () => {
  let component: GeneraldataCardviewComponent;
  let fixture: ComponentFixture<GeneraldataCardviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeneraldataCardviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GeneraldataCardviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

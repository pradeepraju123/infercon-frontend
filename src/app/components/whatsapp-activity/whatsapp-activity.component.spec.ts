import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhatsappActivityComponent } from './whatsapp-activity.component';

describe('WhatsappActivityComponent', () => {
  let component: WhatsappActivityComponent;
  let fixture: ComponentFixture<WhatsappActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WhatsappActivityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhatsappActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

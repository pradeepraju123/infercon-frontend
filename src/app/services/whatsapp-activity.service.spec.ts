import { TestBed } from '@angular/core/testing';

import { WhatsappActivityService } from './whatsapp-activity.service';

describe('WhatsappActivityService', () => {
  let service: WhatsappActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WhatsappActivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

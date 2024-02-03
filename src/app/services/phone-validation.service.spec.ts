import { TestBed } from '@angular/core/testing';

import { PhoneValidationService } from './phone-validation.service';

describe('PhoneValidationService', () => {
  let service: PhoneValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhoneValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { MushonkeyService } from './mushonkey.service';

describe('MushonkeyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MushonkeyService = TestBed.get(MushonkeyService);
    expect(service).toBeTruthy();
  });
});

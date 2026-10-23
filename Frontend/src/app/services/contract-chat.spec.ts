import { TestBed } from '@angular/core/testing';

import { ContractChat } from './contract-chat';

describe('ContractChat', () => {
  let service: ContractChat;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContractChat);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

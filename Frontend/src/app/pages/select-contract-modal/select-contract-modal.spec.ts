import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectContractModal } from './select-contract-modal';

describe('SelectContractModal', () => {
  let component: SelectContractModal;
  let fixture: ComponentFixture<SelectContractModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectContractModal],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectContractModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

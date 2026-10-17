import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractReport } from './contract-report';

describe('ContractReport', () => {
  let component: ContractReport;
  let fixture: ComponentFixture<ContractReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractReport],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractReport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

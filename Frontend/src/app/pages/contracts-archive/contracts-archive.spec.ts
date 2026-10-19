import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractsArchive } from './contracts-archive';

describe('ContractsArchive', () => {
  let component: ContractsArchive;
  let fixture: ComponentFixture<ContractsArchive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractsArchive],
    }).compileComponents();

    fixture = TestBed.createComponent(ContractsArchive);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

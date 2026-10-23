import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiLegalAssistant } from './ai-legal-assistant';

describe('AiLegalAssistant', () => {
  let component: AiLegalAssistant;
  let fixture: ComponentFixture<AiLegalAssistant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiLegalAssistant],
    }).compileComponents();

    fixture = TestBed.createComponent(AiLegalAssistant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

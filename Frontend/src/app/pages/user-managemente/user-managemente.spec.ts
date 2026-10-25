import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserManagemente } from './user-managemente';

describe('UserManagemente', () => {
  let component: UserManagemente;
  let fixture: ComponentFixture<UserManagemente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagemente],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagemente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

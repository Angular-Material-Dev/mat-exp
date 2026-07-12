import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatExpressive } from './mat-exp';

describe('MatExpressive', () => {
  let component: MatExpressive;
  let fixture: ComponentFixture<MatExpressive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatExpressive],
    }).compileComponents();

    fixture = TestBed.createComponent(MatExpressive);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

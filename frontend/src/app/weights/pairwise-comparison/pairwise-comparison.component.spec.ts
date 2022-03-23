import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PairwiseComparisonComponent } from './pairwise-comparison.component';

describe('PairwiseComparisonComponent', () => {
  let component: PairwiseComparisonComponent;
  let fixture: ComponentFixture<PairwiseComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PairwiseComparisonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PairwiseComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

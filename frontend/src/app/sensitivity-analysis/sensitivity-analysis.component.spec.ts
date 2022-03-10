import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensitivityAnalysisComponent } from './sensitivity-analysis.component';

describe('SensitivityAnalysisComponent', () => {
  let component: SensitivityAnalysisComponent;
  let fixture: ComponentFixture<SensitivityAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SensitivityAnalysisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SensitivityAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

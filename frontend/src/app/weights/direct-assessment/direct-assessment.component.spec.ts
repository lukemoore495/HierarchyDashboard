import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectAssessmentComponent } from './direct-assessment.component';

describe('DirectAssessmentComponent', () => {
  let component: DirectAssessmentComponent;
  let fixture: ComponentFixture<DirectAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DirectAssessmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

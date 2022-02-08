import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementsFormComponent } from './measurements-form.component';

describe('MeasurementsFormComponent', () => {
  let component: MeasurementsFormComponent;
  let fixture: ComponentFixture<MeasurementsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeasurementsFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasurementsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

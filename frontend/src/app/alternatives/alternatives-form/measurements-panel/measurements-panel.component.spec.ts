import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementsPanelComponent } from './measurements-panel.component';

describe('MeasurementsPanelComponent', () => {
  let component: MeasurementsPanelComponent;
  let fixture: ComponentFixture<MeasurementsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeasurementsPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasurementsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

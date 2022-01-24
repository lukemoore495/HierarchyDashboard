import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RankChartComponent } from './rank-chart.component';

describe('RankChartComponent', () => {
  let component: RankChartComponent;
  let fixture: ComponentFixture<RankChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RankChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RankChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

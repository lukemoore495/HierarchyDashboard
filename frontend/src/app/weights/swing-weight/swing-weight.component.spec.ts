import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwingWeightComponent } from './swing-weight.component';

describe('SwingWeightComponent', () => {
  let component: SwingWeightComponent;
  let fixture: ComponentFixture<SwingWeightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwingWeightComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwingWeightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportanceValueComponent } from './importance-value.component';

describe('ImportanceValueComponent', () => {
  let component: ImportanceValueComponent;
  let fixture: ComponentFixture<ImportanceValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportanceValueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportanceValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

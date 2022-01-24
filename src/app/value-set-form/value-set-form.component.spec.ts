import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueSetFormComponent } from './value-set-form.component';

describe('ValueSetFormComponent', () => {
  let component: ValueSetFormComponent;
  let fixture: ComponentFixture<ValueSetFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValueSetFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValueSetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

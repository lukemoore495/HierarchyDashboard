import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAlternativeDialogComponent } from './create-alternative-dialog.component';

describe('CreateAlternativeDialogComponent', () => {
  let component: CreateAlternativeDialogComponent;
  let fixture: ComponentFixture<CreateAlternativeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateAlternativeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAlternativeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

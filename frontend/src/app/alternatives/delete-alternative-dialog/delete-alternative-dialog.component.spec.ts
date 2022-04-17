import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAlternativeDialogComponent } from './delete-alternative-dialog.component';

describe('DeleteAlternativeDialogComponent', () => {
  let component: DeleteAlternativeDialogComponent;
  let fixture: ComponentFixture<DeleteAlternativeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteAlternativeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteAlternativeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

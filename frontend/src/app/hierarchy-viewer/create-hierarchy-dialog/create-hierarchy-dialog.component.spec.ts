import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHierarchyDialogComponent } from './create-hierarchy-dialog.component';

describe('CreateHierarchyDialogComponent', () => {
    let component: CreateHierarchyDialogComponent;
    let fixture: ComponentFixture<CreateHierarchyDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ CreateHierarchyDialogComponent ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateHierarchyDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

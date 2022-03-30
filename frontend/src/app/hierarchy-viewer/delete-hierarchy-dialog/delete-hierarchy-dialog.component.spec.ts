import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteHierarchyDialogComponent } from './delete-hierarchy-dialog.component';

describe('DeleteHierarchyDialogComponent', () => {
    let component: DeleteHierarchyDialogComponent;
    let fixture: ComponentFixture<DeleteHierarchyDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ DeleteHierarchyDialogComponent ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DeleteHierarchyDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

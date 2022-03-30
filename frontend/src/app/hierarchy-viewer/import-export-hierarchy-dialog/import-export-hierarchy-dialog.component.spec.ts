import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportExportHierarchyDialogComponent } from './import-export-hierarchy-dialog.component';

describe('ImportExportHierarchyDialogComponent', () => {
    let component: ImportExportHierarchyDialogComponent;
    let fixture: ComponentFixture<ImportExportHierarchyDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ ImportExportHierarchyDialogComponent ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ImportExportHierarchyDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

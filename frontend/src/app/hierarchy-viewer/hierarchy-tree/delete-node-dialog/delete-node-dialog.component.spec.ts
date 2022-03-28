import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteNodeDialogComponent } from './delete-node-dialog.component';

describe('DeleteNodeDialogComponent', () => {
    let component: DeleteNodeDialogComponent;
    let fixture: ComponentFixture<DeleteNodeDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ DeleteNodeDialogComponent ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DeleteNodeDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

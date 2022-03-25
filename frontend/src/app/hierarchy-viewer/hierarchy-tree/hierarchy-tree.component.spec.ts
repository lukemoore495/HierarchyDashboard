import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchyTreeComponent } from './hierarchy-tree.component';

describe('HierarchyTreeComponent', () => {
    let component: HierarchyTreeComponent;
    let fixture: ComponentFixture<HierarchyTreeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ HierarchyTreeComponent ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HierarchyTreeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

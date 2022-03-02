import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchicalViewComponent } from './hierarchical-view.component';

describe('HierarchicalViewComponent', () => {
    let component: HierarchicalViewComponent;
    let fixture: ComponentFixture<HierarchicalViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ HierarchicalViewComponent ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HierarchicalViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

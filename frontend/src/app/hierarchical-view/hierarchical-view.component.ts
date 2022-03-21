import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Hierarchy, HierarchyListItem, Node } from '../Hierarchy';
import { getHierarchies, getSelectedHierarchy } from '../state';
import { createHierarchy, setSelectedHierarchy } from '../state/hierarchy.actions';
import { HierarchyState } from '../state/hierarchy.reducer';
import RRRHierarchy from '../../assets/staticFiles/RRRHierarchyPost.json';
import SimpleHierarchy from '../../assets/staticFiles/SimpleHierarchyPost.json';
import { MatSelectChange } from '@angular/material/select';

@Component({
    selector: 'app-hierarchical-view',
    templateUrl: './hierarchical-view.component.html',
    styleUrls: ['./hierarchical-view.component.scss']
})
export class HierarchicalViewComponent implements OnDestroy {
    selectedHierarchy: Hierarchy | null = null;
    subscriptions: Subscription[] = [];
    hierarchies$?: Observable<HierarchyListItem[]>;

    constructor(private store: Store<HierarchyState>, private renderer: Renderer2) {
        const sub = this.store.select(getSelectedHierarchy)
            .subscribe(hierarchy => {
                if (hierarchy) {
                    this.selectedHierarchy = hierarchy;              
                }
            });
        this.subscriptions.push(sub);
    
        this.hierarchies$ = this.store.select(getHierarchies);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    createHierarchy() {
        this.selectedHierarchy = null;
        //This will go away eventually. We will replace it with creating hierarchies
        //from scratch
        this.store.dispatch(createHierarchy({hierarchy: RRRHierarchy}));
        //this.store.dispatch(createHierarchy({hierarchy: SimpleHierarchy}))
    }

    onSelect(event: MatSelectChange) {
        this.selectedHierarchy = null;
        this.store.dispatch(setSelectedHierarchy({selectedHierarchyId: event.value}));
    }
}

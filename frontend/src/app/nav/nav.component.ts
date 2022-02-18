import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Hierarchy } from '../Hierarchy';
import { Store } from '@ngrx/store';
import { HierarchyState } from '../state/hierarchy.reducer';
import * as HierarchyActions from '../state/hierarchy.actions'
import { getError, getHierarchies } from '../state';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
    hierarchies$?: Observable<Hierarchy[]>;
    errorMessage$?: Observable<string>;

    menuItems = [
        { title: 'Dashboard', route: 'dashboard', icon: 'view_quilt' },
        { title: 'Weights', route: 'importanceValue', icon: 'grid_on' },
        { title: 'Sensitivity Analysis', route: 'sensitivityAnalysis', icon: 'show_chart' },
        { title: 'Hierarchical View', route: 'hierarchicalView', icon: 'pageview' }];

    isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
        .pipe(
            map(result => result.matches),
            shareReplay()
        );

    constructor(private store: Store<HierarchyState>, private breakpointObserver: BreakpointObserver) { }

    ngOnInit(): void {
        this.hierarchies$ = this.store.select(getHierarchies);
        this.errorMessage$ = this.store.select(getError);
        this.store.dispatch(HierarchyActions.retrieveHierarchies());
    }
}

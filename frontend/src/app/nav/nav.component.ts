import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { delay, map, shareReplay, skipWhile, take, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { HierarchyState } from '../state/hierarchy.reducer';
import * as HierarchyActions from '../state/hierarchy.actions';
import { getError, getHierarchies, getSelectedHierarchy } from '../state';
import { HierarchyListItem } from '../Hierarchy';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {
    errorMessage$?: Observable<string>;
    hasHierarchies = false;
    hierarchies: HierarchyListItem[] = [];
    subscriptions: Subscription[] = [];

    menuItems = [
        { title: 'Hierarchy Viewer', route: 'hierarchicalView', icon: 'pageview' },
        { title: 'alternatives', route: 'alternatives', icon: 'query_stats' },
        { title: 'Rank', route: 'rank', icon: 'stacked_bar_chart' }
        //,{ title: 'Sensitivity Analysis', route: 'sensitivityAnalysis', icon: 'ssid_chart' }
    ];

    isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
        .pipe(
            map(result => result.matches),
            shareReplay()
        );

    constructor(private store: Store<HierarchyState>, private breakpointObserver: BreakpointObserver) { }

    ngOnInit(): void {
        this.errorMessage$ = this.store.select(getError);
        this.store.dispatch(HierarchyActions.retrieveHierarchies());
        const getHierarchies$ = this.store.select(getHierarchies);
        const initialSelectSub = getHierarchies$
            .pipe(
                delay(1000),
                tap(x => {
                    if(x.length === 0){
                        this.store.dispatch(HierarchyActions.retrieveHierarchies());
                    }
                }),
                skipWhile(x => x.length === 0),
                take(1)
            )
            .subscribe(hierarchies => {
                if(hierarchies.length > 0){
                    this.store.dispatch(HierarchyActions.setSelectedHierarchy({selectedHierarchyId: hierarchies[0].id}));
                    this.hasHierarchies = true;
                }
            });
        
        const hierarchyListSub = getHierarchies$
            .subscribe(hierarchies => this.hierarchies = hierarchies);
        
        const selectedHierarchySub = this.store.select(getSelectedHierarchy)
            .subscribe(hierarchy => {
                if (!hierarchy && this.hierarchies.length > 0) {
                    this.store.dispatch(
                        HierarchyActions.setSelectedHierarchy({selectedHierarchyId: this.hierarchies[0].id})
                    );
                }
            });
        this.subscriptions.push(initialSelectSub, hierarchyListSub, selectedHierarchySub);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}

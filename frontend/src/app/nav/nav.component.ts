import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { delay, map, shareReplay, skipWhile, take, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { HierarchyState } from '../state/hierarchy.reducer';
import * as HierarchyActions from '../state/hierarchy.actions';
import { getError, getHierarchies } from '../state';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
    errorMessage$?: Observable<string>;

    menuItems = [
        { title: 'Hierarchical View', route: 'hierarchicalView', icon: 'pageview' },
        { title: 'alternatives', route: 'alternatives', icon: 'query_stats' },
        { title: 'Rank', route: 'rank', icon: 'stacked_bar_chart' },
        { title: 'Sensitivity Analysis', route: 'sensitivityAnalysis', icon: 'ssid_chart' }];

    isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
        .pipe(
            map(result => result.matches),
            shareReplay()
        );

    constructor(private store: Store<HierarchyState>, private breakpointObserver: BreakpointObserver) { }

    ngOnInit(): void {
        this.errorMessage$ = this.store.select(getError);
        this.store.dispatch(HierarchyActions.retrieveHierarchies());
        this.store.select(getHierarchies)
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
            .subscribe(x=> {
                if(x.length > 0){
                    this.store.dispatch(HierarchyActions.setSelectedHierarchy({selectedHierarchyId: x[0].id}));
                }
            });
    }
}

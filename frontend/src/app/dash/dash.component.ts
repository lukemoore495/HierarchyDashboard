import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { HierarchyState } from '../state/hierarchy.reducer';
import { getSelectedAlternative, getSelectedHierarchy } from '../state';
import { Alternative } from '../Hierarchy';
import { setSelectedAlternative } from '../state/hierarchy.actions';
import { MatSelectChange } from '@angular/material/select';
import { Observable, Subscription } from 'rxjs';
import { OnDestroy } from '@angular/core';

@Component({
    selector: 'app-dash',
    templateUrl: './dash.component.html',
    styleUrls: ['./dash.component.scss']
})
export class DashComponent implements OnDestroy{
    card1 = 'Value Function';
    card2 = 'Alternatives';
    alternatives$?:Observable<Alternative[]>;
    selectedAlternative: Alternative | null = null;
    subscriptions: Subscription[] = [];

    constructor(private breakpointObserver: BreakpointObserver, private store: Store<HierarchyState>) {
        this.alternatives$ = this.store.select(getSelectedHierarchy).pipe(
            map(hierarchy => hierarchy?.alternatives === undefined ? [] : hierarchy?.alternatives)
        );

        const sub = this.store.select(getSelectedAlternative)
            .subscribe(alternative => this.selectedAlternative = alternative);
        this.subscriptions.push(sub);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    /** Based on the screen size, switch from standard to one column per row */
    cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
        map(({ matches }) => {
            if (matches) {
                return [
                    { title: this.card1, cols: 1, rows: 1 },
                    { title: this.card2, cols: 1, rows: 1 },
                ];
            }

            return [
                { title: this.card1, cols: 1, rows: 2},
                { title: this.card2, cols: 1, rows: 2}
            ];
        })
    );

    onSelectionchange(event:MatSelectChange){
        this.store.dispatch(setSelectedAlternative({selectedAlternativeId: event.value}));
    }
}

import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { HierarchyState } from '../state/hierarchy.reducer';
import { getSelectedHierarchy } from '../state';
import { Alternative } from '../hierarchy';
import { setSelectedAlternative, setSelectedHierarchy } from '../state/hierarchy.actions';
import { MatSelectChange } from '@angular/material/select';

@Component({
    selector: 'app-dash',
    templateUrl: './dash.component.html',
    styleUrls: ['./dash.component.scss']
})
export class DashComponent{
    card2 = 'Value Function';
    card3 = 'Alternatives';
    card1 = 'Rank';

    constructor(private breakpointObserver: BreakpointObserver, private store: Store<HierarchyState>) {
        this.store.select(getSelectedHierarchy).pipe(
            map(hierarchy => hierarchy?.alternatives === undefined ? [] : hierarchy?.alternatives)
        ).subscribe(alternatives => this.alternatives = alternatives);
     }

    /** Based on the screen size, switch from standard to one column per row */
    cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
        map(({ matches }) => {
            if (matches) {
                return [
                    { title: this.card1, cols: 1, rows: 1 },
                    { title: this.card2, cols: 1, rows: 1 },
                    { title: this.card3, cols: 1, rows: 1 },
                ];
            }

            return [
                { title: this.card2, cols: 1, rows: 1.5},
                { title: this.card3, cols: 1, rows: 2 },
                { title: this.card1, cols: 2, rows: 2}
            ];
        })
    );
    
    onSelectionchange(event:MatSelectChange){
        console.log(event.value);
        this.store.dispatch(setSelectedAlternative({selectedAlternativeId: event.value}));
      }
}

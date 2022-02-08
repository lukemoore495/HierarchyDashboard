import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { OnInit } from '@angular/core';
import { HierarchyState } from '../state/hierarchy.reducer';
import { Observable } from 'out/dashboard-app-win32-x64/resources/app/node_modules/rxjs/dist/types';
import { Hierarchy } from '../Hierarchy';
import { getError, getHierarchies } from '../state';
import * as HierarchyActions from '../state/hierarchy.actions'

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.scss']
})
export class DashComponent implements OnInit{
  card1 = "Rank";
  card2 = "Value Function";
  card3 = "Measurements";
  hierarchies$?: Observable<Hierarchy[]>;
  errorMessage$?: Observable<string>;

  constructor(private store: Store<HierarchyState>, private breakpointObserver: BreakpointObserver) { }

  ngOnInit(): void {
    this.hierarchies$ = this.store.select(getHierarchies);
    this.errorMessage$ = this.store.select(getError);
    this.store.dispatch(HierarchyActions.retrieveHierarchies());
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
        { title: this.card1, cols: 2, rows: 2},
        { title: this.card2, cols: 1, rows: 1.5},
        { title: this.card3, cols: 1, rows: 2 },
      ];
    })
  );
  
}

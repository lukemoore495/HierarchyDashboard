import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.scss']
})
export class DashComponent {
  card1 = "Rank";
  card2 = "Value Function";
  card3 = "Measurements";

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

  constructor(private breakpointObserver: BreakpointObserver) {}
}

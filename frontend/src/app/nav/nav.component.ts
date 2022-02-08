import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {

menuItems = [
  {title: 'Dashboard', route: 'dashboard', icon: 'view_quilt'},
  {title: 'Weights', route: 'importanceValue', icon: 'grid_on'}, 
  {title: 'Hierarchical View', route: 'hierarchicalView', icon: 'pageview'}];

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver) {}

}

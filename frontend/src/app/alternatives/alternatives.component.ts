import { Component, OnDestroy } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { HierarchyState } from '../state/hierarchy.reducer';
import { getSelectedAlternative, getSelectedHierarchy } from '../state';
import { Alternative } from '../Hierarchy';
import { setSelectedAlternative } from '../state/hierarchy.actions';
import { MatSelectChange } from '@angular/material/select';
import { Observable, Subscription } from 'rxjs';
import { CreateAlternativeDialogComponent } from './create-alternative-dialog/create-alternative-dialog.component';
import { DeleteAlternativeDialogComponent } from './delete-alternative-dialog/delete-alternative-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CreateHierarchyAlternative, HierarchyAlternative } from './AlternativeForm';

@Component({
    selector: 'app-alternatives',
    templateUrl: './alternatives.component.html',
    styleUrls: ['./alternatives.component.scss']
})
export class AlternativesComponent implements OnDestroy {
    card1 = 'Value Function';
    card2 = 'Alternatives';
    alternatives$?: Observable<Alternative[]>;
    selectedAlternative: Alternative | null = null;
    subscriptions: Subscription[] = [];
    selectedHierarchyId?: string;

    constructor(public dialog: MatDialog, private breakpointObserver: BreakpointObserver, private store: Store<HierarchyState>) {
        this.alternatives$ = this.store.select(getSelectedHierarchy).pipe(
            map(hierarchy => hierarchy?.alternatives === undefined ? [] : hierarchy?.alternatives)
        );

        this.store.select(getSelectedHierarchy)
            .subscribe(hierarchy => { this.selectedHierarchyId = hierarchy?.id });

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
                { title: this.card1, cols: 1, rows: 2 },
                { title: this.card2, cols: 1, rows: 2 }
            ];
        })
    );

    onSelectionchange(event: MatSelectChange) {
        this.store.dispatch(setSelectedAlternative({ selectedAlternativeId: event.value }));
    }

    createAlternativeDialog() {
        this.dialog.open(CreateAlternativeDialogComponent, {
            data: { hierarchyId: this.selectedHierarchyId } as CreateHierarchyAlternative
        });
    }

    deleteAlternativeDialog() {
        this.dialog.open(DeleteAlternativeDialogComponent, {
            data: {
                hierarchyId: this.selectedHierarchyId,
                alternative: this.selectedAlternative
            } as HierarchyAlternative
        });
    }
}

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { createAlternative, createAlternativeSuccess } from 'src/app/state/hierarchy.actions';
import { HierarchyState } from 'src/app/state/hierarchy.reducer';
import { CreateHierarchyAlternative } from '../AlternativeForm';

@Component({
    selector: 'app-create-alternative-dialog',
    templateUrl: './create-alternative-dialog.component.html',
    styleUrls: ['./create-alternative-dialog.component.scss']
})
export class CreateAlternativeDialogComponent {
    form: CreateHierarchyAlternative;
    loading = false;

    constructor(
        public dialogRef: MatDialogRef<CreateAlternativeDialogComponent>,
        private store: Store<HierarchyState>,
        @Inject(MAT_DIALOG_DATA) public data: CreateHierarchyAlternative,
        private actions$: Actions) {
        this.form = {
            name: '',
            hierarchyId: data.hierarchyId
        };
    }

    doAction() {
        this.loading = true;
        this.store.dispatch(createAlternative({ createHierarchyAlternative: this.form }));
        this.actions$
            .pipe(
                ofType(createAlternativeSuccess)
            ).subscribe(_ => this.dialogRef.close());
    }

    closeDialog() {
        this.dialogRef.close();
    }
}

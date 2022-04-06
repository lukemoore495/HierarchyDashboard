import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { deleteAlternative, deleteAlternativeSuccess } from 'src/app/state/hierarchy.actions';
import { HierarchyState } from 'src/app/state/hierarchy.reducer';
import { HierarchyAlternative } from '../AlternativeForm';

@Component({
    selector: 'app-delete-alternative-dialog',
    templateUrl: './delete-alternative-dialog.component.html',
    styleUrls: ['./delete-alternative-dialog.component.scss']
})
export class DeleteAlternativeDialogComponent {
    form: HierarchyAlternative;
    loading = false;

    constructor(
        public dialogRef: MatDialogRef<DeleteAlternativeDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: HierarchyAlternative,
        private store: Store<HierarchyState>,
        private actions$: Actions) { this.form = data }

    doAction() {
        this.loading = true;
        this.store.dispatch(deleteAlternative({ hierarchyAlternative: this.form }));
        this.actions$
            .pipe(
                ofType(deleteAlternativeSuccess)
            ).subscribe(_ => this.dialogRef.close());
    }

    closeDialog() {
        this.dialogRef.close();
    }
}

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { deleteHierarchy, deleteHierarchySuccess } from 'src/app/state/hierarchy.actions';
import { HierarchyState } from 'src/app/state/hierarchy.reducer';
import { DeleteHierarchyData } from './DeleteHierarchyData';

@Component({
    selector: 'app-delete-hierarchy-dialog',
    templateUrl: './delete-hierarchy-dialog.component.html',
    styleUrls: ['./delete-hierarchy-dialog.component.scss']
})
export class DeleteHierarchyDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<DeleteHierarchyDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DeleteHierarchyData,
        private store: Store<HierarchyState>,
        private actions$: Actions) {}

    doAction() {
        this.store.dispatch(deleteHierarchy({ hierarchyId: this.data.id }));
        this.actions$
            .pipe(
                ofType(deleteHierarchySuccess)
            ).subscribe(_ => this.dialogRef.close());
    }

    closeDialog() {
        this.dialogRef.close();
    }

}

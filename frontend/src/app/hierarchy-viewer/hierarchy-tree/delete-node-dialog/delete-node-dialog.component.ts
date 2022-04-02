import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { deleteNode, deleteNodeSuccess } from 'src/app/state/hierarchy.actions';
import { HierarchyState } from 'src/app/state/hierarchy.reducer';
import { DeleteNodeData } from './DeleteNodeData';

@Component({
    selector: 'app-delete-node-dialog',
    templateUrl: './delete-node-dialog.component.html',
    styleUrls: ['./delete-node-dialog.component.scss']
})
export class DeleteNodeDialogComponent {
    subscriptions: Subscription[] = [];
    loading = false;

    constructor(public dialogRef: MatDialogRef<DeleteNodeDialogComponent>, 
        @Inject(MAT_DIALOG_DATA) private data: DeleteNodeData, 
        private store: Store<HierarchyState>, 
        private actions$: Actions) { }

    doAction() {
        this.loading = true;
        this.store.dispatch(deleteNode({hierarchyId: this.data.hierarchyId, nodeId: this.data.nodeId}));

        const sub = this.actions$
            .pipe(ofType(deleteNodeSuccess))
            .subscribe(_ => this.dialogRef.close());

        this.subscriptions.push(sub);
    }

    closeDialog() {
        this.dialogRef.close();
    }

}

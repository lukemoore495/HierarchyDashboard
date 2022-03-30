import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-delete-hierarchy-dialog',
    templateUrl: './delete-hierarchy-dialog.component.html',
    styleUrls: ['./delete-hierarchy-dialog.component.scss']
})
export class DeleteHierarchyDialogComponent {

    constructor(
        public dialogRef: MatDialogRef<DeleteHierarchyDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    doAction() {
        this.dialogRef.close({ event: 'Delete' });
    }

    closeDialog() {
        this.dialogRef.close({ event: 'Cancel' });
    }

}

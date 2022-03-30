import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-create-hierarchy-dialog',
    templateUrl: './create-hierarchy-dialog.component.html',
    styleUrls: ['./create-hierarchy-dialog.component.scss']
})
export class CreateHierarchyDialogComponent {

    constructor(
        public dialogRef: MatDialogRef<CreateHierarchyDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    doAction() {
        this.dialogRef.close({ event: 'Create', name: this.data.name, description: this.data.description });
    }

    closeDialog() {
        this.dialogRef.close({ event: 'Cancel' });
    }
}
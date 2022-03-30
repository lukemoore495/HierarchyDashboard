import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { HierarchyRequest } from 'src/app/hierarchy.service';
import { createHierarchy, createHierarchySuccess } from 'src/app/state/hierarchy.actions';
import { HierarchyState } from 'src/app/state/hierarchy.reducer';
import { CreateHierarchyForm } from './CreateHierarchyForm';

@Component({
    selector: 'app-create-hierarchy-dialog',
    templateUrl: './create-hierarchy-dialog.component.html',
    styleUrls: ['./create-hierarchy-dialog.component.scss']
})
export class CreateHierarchyDialogComponent {
    form: CreateHierarchyForm;

    constructor(
        public dialogRef: MatDialogRef<CreateHierarchyDialogComponent>,
        private store: Store<HierarchyState>,
        private actions$: Actions) { 
        this.form = {
            name: '',
            description: ''
        };
    }

    doAction() {
        const hierarchyRequest: HierarchyRequest = {
            name: this.form.name, description: this.form.description, nodes: [], alternatives: []
        };
        this.store.dispatch(createHierarchy({ hierarchy: hierarchyRequest }));
        this.actions$
            .pipe(
                ofType(createHierarchySuccess)
            ).subscribe(_ => this.dialogRef.close());
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
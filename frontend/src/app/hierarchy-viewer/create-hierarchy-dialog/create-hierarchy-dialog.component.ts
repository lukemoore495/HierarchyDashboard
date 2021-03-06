import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { HierarchyRequest } from '../../hierarchy.service';
import { createHierarchy, createHierarchySuccess } from '../../state/hierarchy.actions';
import { HierarchyState } from '../../state/hierarchy.reducer';
import { CreateHierarchyForm } from './CreateHierarchyForm';

@Component({
    selector: 'app-create-hierarchy-dialog',
    templateUrl: './create-hierarchy-dialog.component.html',
    styleUrls: ['./create-hierarchy-dialog.component.scss']
})
export class CreateHierarchyDialogComponent {
    form: CreateHierarchyForm;
    loading = false;

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
        this.loading = true;
        const hierarchyRequest: HierarchyRequest = {
            name: this.form.name, 
            description: this.form.description, 
            root: {
                name: this.form.name,
                weight: 1,
                children: [],
                icon: null
            }, 
            alternatives: []
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
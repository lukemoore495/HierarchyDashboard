import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { MeasurementType } from '../../../Hierarchy';
import { MeasurementDefinitionRequest, NodeRequest } from '../../../hierarchy.service';
import { createNode, createNodeSuccess } from '../../../state/hierarchy.actions';
import { HierarchyState } from '../../../state/hierarchy.reducer';
import { CreateNodeData, CreateNodeForm } from './CreateNode';

@Component({
    selector: 'app-add-node-dialog',
    templateUrl: './add-node-dialog.component.html',
    styleUrls: ['./add-node-dialog.component.scss']
})
export class AddNodeDialogComponent implements OnDestroy{
    form: CreateNodeForm;
    measurementTypes: string[] = [];
    subscriptions: Subscription[] = [];
    parentId: string;
    hierarchyId: string;
    loading = false;

    constructor(public dialogRef: MatDialogRef<CreateNodeForm>, 
        @Inject(MAT_DIALOG_DATA) public data: CreateNodeData, 
        private store: Store<HierarchyState>, 
        private actions$: Actions) {
        this.parentId = data.parentId;
        this.hierarchyId= data.hierarchyId;
        this.form = {
            isMeasurement: false,
            measurementType: null,
            name: '',
            point1: {x: null, y: null},
            point2: {x: null, y: null}
        };
        this.measurementTypes = Object.keys(MeasurementType);
    }
    
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    onSubmit() {
        this.loading = true;
        const measurementDefinition: MeasurementDefinitionRequest | undefined = 
        this.form.isMeasurement && this.form.measurementType ? {
            measurementType: this.form.measurementType
        } : undefined;
        const newNode: NodeRequest = {
            name: this.form.name,
            weight: 0,
            children: [],
            icon: null,
            measurementDefinition: measurementDefinition
        }; 
        this.store.dispatch(createNode({hierarchyId: this.hierarchyId, parentId: this.parentId, node: newNode}));

        const sub = this.actions$
            .pipe(ofType(createNodeSuccess))
            .subscribe(_ => this.dialogRef.close());

        this.subscriptions.push(sub);
    }

    closeDialog() {
        this.dialogRef.close();
    }

    setMeasurementType(){
        if(!this.form.isMeasurement){
            this.form.measurementType = null;
        }
    }
}

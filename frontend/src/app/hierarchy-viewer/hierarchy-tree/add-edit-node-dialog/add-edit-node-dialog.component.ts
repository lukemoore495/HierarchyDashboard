import { Point } from '@angular/cdk/drag-drop';
import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { MeasurementType, Node, VFType } from '../../../Hierarchy';
import { MeasurementDefinitionRequest, NodeRequest } from '../../../hierarchy.service';
import { createNode, createNodeSuccess, patchNode, patchNodeSuccess } from '../../../state/hierarchy.actions';
import { HierarchyState } from '../../../state/hierarchy.reducer';
import { NodeDialogData, NodeForm, PointForm } from './NodeDialog';

@Component({
    selector: 'app-add-edit-node-dialog',
    templateUrl: './add-edit-node-dialog.component.html',
    styleUrls: ['./add-edit-node-dialog.component.scss']
})
export class AddEditNodeDialogComponent implements OnDestroy{
    existingNode: Node | null;
    form: NodeForm;
    measurementTypes: string[] = [];
    subscriptions: Subscription[] = [];
    parentId: string | null;
    hierarchyId: string;
    loading = false;

    constructor(public dialogRef: MatDialogRef<AddEditNodeDialogComponent>, 
        @Inject(MAT_DIALOG_DATA) public data: NodeDialogData, 
        private store: Store<HierarchyState>, 
        private actions$: Actions) {
        this.parentId = data.parentId ?? null;
        this.existingNode = data.existingNode ?? null;
        this.hierarchyId = data.hierarchyId;
        this.form = this.getForm();
        this.measurementTypes = Object.keys(MeasurementType);
    }
    
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    getForm(): NodeForm{
        if(this.existingNode){
            let point1: PointForm = {x: null, y: null};
            let point2: PointForm = {x: null, y: null};
            if(this.existingNode.measurementDefinition?.referencePoints 
                && this.existingNode.measurementDefinition?.referencePoints.length >= 2){
                point1 = this.existingNode.measurementDefinition.referencePoints[0];
                point2 = this.existingNode.measurementDefinition.referencePoints[1];
            }

            return {
                isMeasurement: this.existingNode.measurementDefinition ? true : false,
                measurementType: this.existingNode.measurementDefinition?.measurementType as MeasurementType ?? null,
                name: this.existingNode.name,
                point1: point1 as PointForm,
                point2: point2 as PointForm
            };
        }
        
        return {
            isMeasurement: false,
            measurementType: null,
            name: '',
            point1: {x: null, y: null},
            point2: {x: null, y: null}
        };                 
    }

    onSubmit() {
        this.loading = true;
        const referencePoints = 
            this.form.point1.x !== null
            && this.form.point1.y !== null
            && this.form.point2.x !== null
            && this.form.point2.y !== null
                ? [this.form.point1 as Point, this.form.point2 as Point]
                : [];
                
        const measurementDefinition: MeasurementDefinitionRequest | undefined = 
            this.form.isMeasurement && this.form.measurementType ? {
                measurementType: this.form.measurementType,
                referencePoints: referencePoints,
                VFType: VFType[VFType.Linear]
            } : undefined;

        const newNode: NodeRequest = {
            name: this.form.name,
            children: [],
            icon: null,
            measurementDefinition: measurementDefinition
        }; 

        if(this.existingNode){
            this.editNode(this.hierarchyId, this.existingNode.id, newNode);
            return;
        }
        if(this.parentId){
            this.addNode(this.hierarchyId, this.parentId, newNode);
        }
    }

    addNode(hierarchyId: string, parentId: string, node: NodeRequest){
        this.store.dispatch(createNode({hierarchyId: hierarchyId, parentId: parentId, node: node}));

        const sub = this.actions$
            .pipe(ofType(createNodeSuccess))
            .subscribe(_ => this.dialogRef.close());

        this.subscriptions.push(sub);
    }

    editNode(hierarchyId: string, nodeId: string, node: NodeRequest){
        this.store.dispatch(patchNode({hierarchyId: hierarchyId, nodeId: nodeId, node: node}));

        const sub = this.actions$
            .pipe(ofType(patchNodeSuccess))
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

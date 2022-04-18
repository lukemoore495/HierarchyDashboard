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
    hideMeasurementDefinition = false;
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

        if(this.existingNode && !this.existingNode?.measurementDefinition){
            this.hideMeasurementDefinition = true;
        }
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
                point1: {x: point1.x, y: point1.y},
                point2: {x: point2.x, y: point2.y}
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

    getMinInput(measurementType: MeasurementType | null){
        if(measurementType === MeasurementType.Percentage){
            return 0;
        } 
        return null;    
    }

    getMaxInput(measurementType: MeasurementType | null){
        if(measurementType === MeasurementType.Percentage){
            return 100;
        }   
        return null;  
    }

    getInputType(measurementType: MeasurementType | null){
        if(measurementType === MeasurementType.Boolean){
            return 'text';
        }   
        return 'number';  
    }

    isBoolean(measurementType: MeasurementType | null){
        if(measurementType === MeasurementType.Boolean){
            return true;
        }   
        return false;  
    }

    getValue(measurementType: MeasurementType | null, firstInput: boolean){
        if(measurementType === MeasurementType.Boolean && firstInput){
            return 'True';
        }   
        if(measurementType === MeasurementType.Boolean){
            return 'False';
        }   
        return '';  
    }

    setBooleanValue(measurementType: MeasurementType | null){
        if(measurementType === MeasurementType.Boolean){
            this.form.point1.x = 0;
            this.form.point2.x = 1;
        }  
    }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map, Observable, Subscription } from 'rxjs';
import { Hierarchy, Value, Node } from '../../Hierarchy';
import { getSelectedAlternative, getSelectedHierarchy } from '../../state';
import { updateAlternativeMeasure } from '../../state/hierarchy.actions';
import { HierarchyState } from '../../state/hierarchy.reducer';

@Component({
    selector: 'app-alternatives-form',
    templateUrl: './alternatives-form.component.html',
    styleUrls: ['./alternatives-form.component.scss']
})
export class AlternativesFormComponent implements OnInit, OnDestroy {
    selectedHierarchy$?: Observable<Hierarchy | null | undefined>;
    measurementNodes: Node[] | null = null;
    currentMeasurements: Value[] = [];
    hierarchyId: string | null = null;
    alternativeId: string | null = null;
    subscriptions: Subscription[] = [];

    constructor(private store: Store<HierarchyState>) { }

    ngOnInit(): void {
        this.selectedHierarchy$ = this.store.select(getSelectedHierarchy);
        const hierarchySub = this.selectedHierarchy$.subscribe(hierarchy => {
            if(!hierarchy){
                return;
            }
            this.hierarchyId = hierarchy.id;
            hierarchy.root ? this.measurementNodes = this.selectMeasurements(hierarchy.root) : this.measurementNodes = null;
        });
        const alternativeSub = this.store.select(getSelectedAlternative).subscribe(alternative => {
            if(!alternative){
                return;
            }
            this.alternativeId = alternative.id;
        });
        this.subscriptions.push(hierarchySub, alternativeSub);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    selectMeasurements(node: Node): Node[] {
        const findChildMeasurements = (node: Node): Node[] => {
            const childMeasurementNodes : Node[] = [];
            if(node.children.length === 0){
                return childMeasurementNodes;
            } else if(node.children?.every(x => this.hasMeasurementNode(x))){
                childMeasurementNodes.push(node);
            } else if(node.children?.some(x => this.hasMeasurementNode(x))){
                const innerNodes = node.children.filter(x => !this.hasMeasurementNode(x));
                const allMeasurementNodes = node.children.filter(x => this.hasMeasurementNode(x));
                innerNodes.forEach(node => allMeasurementNodes.push(...this.selectMeasurements(node)));
                const nodeWithChildren = {...node, children: allMeasurementNodes};
                childMeasurementNodes.push(nodeWithChildren);
            } else if (node.children){
                node.children.forEach(child => childMeasurementNodes.push(...findChildMeasurements(child)));
            }
            return childMeasurementNodes;
        };

        const measurementNodes : Node[] = [];
        measurementNodes.push(...findChildMeasurements(node));
        return measurementNodes;
    }

    hasMeasurementNode(node: Node): boolean {
        return node.children.some(node => node.measurementDefinition);
    }

    saveMeasurements(newMeasurements : Value[]){
        const hierarchyId = this.hierarchyId ?? null;
        const alternativeId = this.alternativeId ?? null;
        if(!hierarchyId || !alternativeId){
            return;
        }
        newMeasurements.forEach(measurement => {
            if(measurement.measure === null){
                return;
            }
            this.store.dispatch(
                updateAlternativeMeasure(
                    {
                        hierarchyId: hierarchyId, 
                        alternativeId: alternativeId, 
                        nodeId: measurement.nodeId, 
                        measure: measurement.measure
                    }
                ));
        });
    }

}

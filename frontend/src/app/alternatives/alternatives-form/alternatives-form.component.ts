import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
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
            const newMeasurementNodes = hierarchy.root ? this.selectMeasurements(hierarchy.root) : null;
            if(newMeasurementNodes?.length !== this.measurementNodes?.length){
                this.measurementNodes = newMeasurementNodes;
            }
        });
        const alternativeSub = this.store.select(getSelectedAlternative).subscribe(alternative => {
            if(!alternative){
                this.alternativeId = null;
                return;
            }
            this.alternativeId = alternative.id;
        });
        this.subscriptions.push(hierarchySub, alternativeSub);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    includeTopLevelNodes(measurementNodes: Node[], node: Node): Node[] {
        const combineIntoExistingPanel = (measurementNodes: Node[], node: Node, topLevelNodes: Node[]): Node[] => {
            measurementNodes = measurementNodes.filter(x => x.id !== node.id);
            const children = [...node.children];
            const topLevel: Node = {
                id: '',
                icon: null,
                weight: 0,
                name: '',
                children: topLevelNodes
            };
            children.unshift(topLevel);
            measurementNodes.push({
                ...node,
                children: children
            });
            return measurementNodes;
        };
        const projectIntoNewPanel = (measurementNodes: Node[], node: Node, topLevelNodes: Node[]): Node[] => {
            const children: Node = {
                id: '',
                icon: null,
                weight: 0,
                name: node.name,
                children: topLevelNodes
            };
            const topLevel: Node = {
                ...children,
                name: 'Top Level',
                children: [children]
            };
            measurementNodes.unshift(topLevel);
            return measurementNodes;
        };

        const topLevelChildren = node.children.filter(x => x.measurementDefinition);
        if(topLevelChildren.length === 0){
            return measurementNodes;
        }

        const top = measurementNodes.find(x => x.id === node.id);
        if(top){
            return combineIntoExistingPanel(measurementNodes, top, topLevelChildren);
        }
        return projectIntoNewPanel(measurementNodes, node, topLevelChildren);
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
        return this.includeTopLevelNodes(measurementNodes, node); 
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

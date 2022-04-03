import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { Hierarchy, Value, Node } from '../../Hierarchy';
import { getSelectedHierarchy } from '../../state';
import { HierarchyState } from '../../state/hierarchy.reducer';

@Component({
    selector: 'app-alternatives-form',
    templateUrl: './alternatives-form.component.html',
    styleUrls: ['./alternatives-form.component.scss']
})
export class AlternativesFormComponent implements OnInit {
    selectedHierarchy$?: Observable<Hierarchy | null | undefined>;
    measurementNodes: Node[] | null = null;
    currentMeasurements: Value[] = [];

    constructor(private store: Store<HierarchyState>) { }

    ngOnInit(): void {
        this.selectedHierarchy$ = this.store.select(getSelectedHierarchy);
        this.selectedHierarchy$.pipe(
            map(hierarchy => hierarchy?.root),
        ).subscribe(root => {
            root ? this.measurementNodes = this.selectMeasurements(root) : this.measurementNodes = null;
        });
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
        //replace this with an api call in the future
        console.log(newMeasurements);
    }

}

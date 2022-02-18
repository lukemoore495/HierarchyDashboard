import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { Hierarchy, Measurement, Node } from '../Hierarchy';
import { getSelectedHierarchy } from '../state';
import { HierarchyState } from '../state/hierarchy.reducer';

@Component({
    selector: 'app-measurements-form',
    templateUrl: './measurements-form.component.html',
    styleUrls: ['./measurements-form.component.scss']
})
export class MeasurementsFormComponent implements OnInit {
    selectedHierarchy$?: Observable<Hierarchy | null | undefined>;
    measurementNodes: Node[] | null = null;
    currentMeasurements: Measurement[] = [];

    constructor(private store: Store<HierarchyState>) { }

    ngOnInit(): void {
        this.selectedHierarchy$ = this.store.select(getSelectedHierarchy);
        this.selectedHierarchy$.pipe(
            map(hierarchy => hierarchy?.nodes === undefined ? null : hierarchy?.nodes),
        ).subscribe(nodes => {
            nodes ? this.measurementNodes = this.selectMeasurements(nodes) : this.measurementNodes = null;
        });
    }

    selectMeasurements(nodes: Node[]): Node[] {
        let findChildMeasurements = (node: Node): Node[] => {
            let childMeasurementNodes : Node[] = [];
            if(node.children?.every(x => x.measurements.length > 0)){
                childMeasurementNodes.push(node);
            } else if(node.children?.some(x => x.measurements.length > 0)){
                let innerNodes = node.children.filter(x => !(x.measurements.length > 0));
                let allMeasurementNodes = node.children.filter(x => x.measurements.length > 0);
                allMeasurementNodes.push(...this.selectMeasurements(innerNodes));
                let nodeWithChildren = {...node, children: allMeasurementNodes}
                childMeasurementNodes.push(nodeWithChildren);
            } else if (node.children){
                node.children.forEach(child => childMeasurementNodes.push(...findChildMeasurements(child)));
            }
            return childMeasurementNodes;
        }
        let measurementNodes : Node[] = [];
        nodes.forEach(node => measurementNodes.push(...findChildMeasurements(node)));
        return measurementNodes;
    }

    saveMeasurements(newMeasurements : Measurement[]){
        let updatedMeasurements = [];
        for(let currentMeasure of this.currentMeasurements){
            let updatedMeasure = newMeasurements.find(newMeasure => newMeasure.measurementDefinitionId == currentMeasure.measurementDefinitionId) ?? currentMeasure;
            updatedMeasurements.push(updatedMeasure);
        }
        for (let measure of newMeasurements) {
            if(!this.currentMeasurements.some(currentMeasure => currentMeasure.measurementDefinitionId == measure.measurementDefinitionId)){
                updatedMeasurements.push(measure);
            }
        }
        this.currentMeasurements = updatedMeasurements;
        
        //replace this with an api call in the future
        console.log(this.currentMeasurements);
    }

}

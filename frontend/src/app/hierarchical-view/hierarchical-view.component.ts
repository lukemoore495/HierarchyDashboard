import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Hierarchy, Node } from '../Hierarchy';
import { getSelectedHierarchy } from '../state';
import { HierarchyState } from '../state/hierarchy.reducer';

@Component({
    selector: 'app-hierarchical-view',
    templateUrl: './hierarchical-view.component.html',
    styleUrls: ['./hierarchical-view.component.scss']
})
export class HierarchicalViewComponent implements OnInit, AfterViewInit {
    hierarchyLevels: Node[][] = [];
    elem: Element | null = null;
    relationships: string[] = [];

    constructor(private store: Store<HierarchyState>) { }

    ngOnInit(): void {
        this.store.select(getSelectedHierarchy)
            .subscribe(hierarchy => {
                if (hierarchy) {
                    this.hierarchyLevels = this.sortNodesToLevels(hierarchy);
                    this.relationships = this.findRelationships(this.hierarchyLevels);
                }
            });
    }

    ngAfterViewInit() {
        let currentParent: string | null = null;
        let currentChildren: string[] = [];
        for(let i = 0; i < this.relationships.length; i++){
            let relationship = this.relationships[i].split(",");
            if(currentParent === null){
                currentParent = relationship[0];
                currentChildren.push(relationship[1])
            } else if(currentParent !== relationship[0]){
                this.repositionChildren(currentChildren, currentParent);
                currentParent = relationship[0];
                currentChildren = [relationship[1]];
            } else {
                currentChildren.push(relationship[1]);
            }
        }
        if(currentParent !== null)
            this.repositionChildren(currentChildren, currentParent);

        for(let i = 0; i < this.relationships.length; i++){
            let relationship = this.relationships[i].split(",");
            let lineId = "line" + i.toString();
            this.drawLine(relationship[0], relationship[1], lineId);
        }
    }

    repositionChildren(childrenIds: string[], parentId: string) {
        let parentPosition = document.getElementById(parentId)?.getBoundingClientRect();
        if(!parentPosition){
            return;
        }

        let first = document.getElementById(childrenIds[0]);
        let last = document.getElementById(childrenIds[childrenIds.length-1]);
        if(!first || !last)
            return;
        let firstPos = first.getBoundingClientRect();
        let lastPos = last.getBoundingClientRect();
        let fullLength = (lastPos.x + lastPos.width) - (firstPos.x + firstPos.width);
        let commonOffset = fullLength/childrenIds.length;
        if(childrenIds.length % 2 === 0){
            for(let i = 0; i < childrenIds.length; i++){
                let child = document.getElementById(childrenIds[i]);
                if(!child) {
                    continue;
                }
                let childPosition = child.getBoundingClientRect();
                let center = parentPosition.x - childPosition.x;
                if(i <= childrenIds.length/2){
                    let offset = "left:" + (center - (commonOffset * (childrenIds.length/2 - i))).toString() + "px";
                    child.setAttribute("style", offset);
                } else {
                    let offset = "left:" + (center + (commonOffset * ((i+1) - childrenIds.length/2))).toString() + "px";
                    child.setAttribute("style", offset);
                }
            }
        } else {
            for(let i = 0; i < childrenIds.length; i++){
                let child = document.getElementById(childrenIds[i]);
                if(!child) {
                    continue;
                }
                let childPosition = child.getBoundingClientRect();
                let center = parentPosition.x - childPosition.x;
                let middleIndex = ~~(childrenIds.length/2);
                if(i === middleIndex){
                    let offset = "left:" + center.toString() + "px";
                    child.setAttribute("style", offset);
                }else if(i < middleIndex){
                    let offset = "left:" + (center - (commonOffset * (middleIndex - i))).toString() + "px";
                    child.setAttribute("style", offset);
                } else {
                    let offset = "left:" + (center + (commonOffset * (i - middleIndex))).toString() + "px";
                    child.setAttribute("style", offset);
                }
            }
        }
    }

    drawLine(parentId: string, childId: string, lineId: string){
        let top = document.getElementById(parentId);
        let child = document.getElementById(childId);
        let line = document.getElementById(lineId);
        if(!line)
            return;

        let pos1 = child?.getBoundingClientRect();
        let pos2 = top?.getBoundingClientRect();

        let x1Offset = pos1?.x ? pos1.right - pos1.width * 2: 0;
        let x2Offset = pos2?.x ? pos2.right - pos2.width * 2: 0;
        let y1Offset = pos1?.top ? pos1.top - pos1.height/2 : 0;
        let y2Offset = pos2?.top ? pos2.top - pos2.height/2 : 0;
        let x1 = x1Offset.toString() ?? "0"
        let y1 = y1Offset.toString() ?? "0"
        let x2 = x2Offset.toString() ?? "0"
        let y2 = y2Offset.toString() ?? "0"

        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
    }

    sortNodesToLevels(hierarchy: Hierarchy): Node[][] {
        let levels: Node[][] = [];
        let addNodesToLevel = (node: Node, currentLevel: number) => {
            if (!levels[currentLevel]) {
                levels.push([]);
            }
            levels[currentLevel].push(node);
            let nextLevel = currentLevel + 1;
            node.children.forEach(child => addNodesToLevel(child, nextLevel));
        }
        hierarchy.nodes.forEach(node => addNodesToLevel(node, 0));
        return levels;
    }

    findRelationships(levels: Node[][]): string[]{
        let relationships: string[] = [];
        for(let i = 0; i < levels[0].length; i++){
            relationships.push("topLevel" + ",0" + i.toString());
        }
        for(let i = 0; i < levels.length; i++){
            for(let k = 0; k < levels[i].length; k++){
                let node = levels[i][k];
                let indexes : string[] = [];
                let currentNodeId = i.toString() + k.toString();
                node.children.forEach(child => indexes.push(currentNodeId + "," + (i+1).toString() + (levels[i+1].findIndex(node => node === child).toString())));
                relationships.push(...indexes)
            }
        }
        return relationships;
    }
}

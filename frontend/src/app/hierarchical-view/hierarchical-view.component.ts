import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Hierarchy, Node } from '../hierarchy';
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
        // let currentParent: string | null = null;
        // let currentChildren: string[] = [];
        // console.log(this.relationships);
        // for (let i = 0; i < this.relationships.length; i++) {
        //     let relationship = this.relationships[i].split(",");
        //     if (currentParent === null) {
        //         currentParent = relationship[0];
        //         currentChildren.push(relationship[1])
        //     } else if (currentParent !== relationship[0]) {
        //         this.repositionChildren(currentChildren, currentParent, Number(currentChildren[0][0])+1);
        //         currentParent = relationship[0];
        //         currentChildren = [relationship[1]];
        //     } else {
        //         currentChildren.push(relationship[1]);
        //     }
        // }
        // if (currentParent !== null)
        //     this.repositionChildren(currentChildren, currentParent, Number(currentChildren[0][0])+1);

        for (let i = 0; i < this.relationships.length; i++) {
            let relationship = this.relationships[i].split(",");
            let lineId1 = "line" + i.toString() + "0";
            let lineId2 = "line" + i.toString() + "1";
            let lineId3 = "line" + i.toString() + "2";

            this.drawLineConnection(relationship[0], relationship[1], lineId1, lineId2, lineId3);
        }
    }

    repositionChildren(childrenIds: string[], parentId: string, level: number) {
        // let parentPosition = document.getElementById(parentId)?.getBoundingClientRect();
        // if (!parentPosition) {
        //     return;
        // }

        // const commonOffset = 1000 * (1/(level*2));
        // if(childrenIds.length % 2 === 0){
        //     for(let i = 0; i < childrenIds.length; i++){
        //         let child = document.getElementById(childrenIds[i]);
        //         if(!child) {
        //             continue;
        //         }
        //         let childPosition = child.getBoundingClientRect();
        //         let center = parentPosition.x - childPosition.x;
        //         if(i < childrenIds.length/2){
        //             let offset = "left:" + (center - (commonOffset/2 * (childrenIds.length/2 - i))).toString() + "px";
        //             child.setAttribute("style", offset);
        //         } else {
        //             let offset = "left:" + (center + (commonOffset/2 * ((i+1) - childrenIds.length/2))).toString() + "px";
        //             child.setAttribute("style", offset);
        //         }
        //     }
        // } else {
        //     for(let i = 0; i < childrenIds.length; i++){
        //         let child = document.getElementById(childrenIds[i]);
        //         if(!child) {
        //             continue;
        //         }
        //         let childPosition = child.getBoundingClientRect();
        //         let center = parentPosition.x - childPosition.x;
        //         let middleIndex = ~~(childrenIds.length/2);
        //         if(i === middleIndex){
        //             let offset = "left:" + center.toString() + "px";
        //             child.setAttribute("style", offset);
        //         }else if(i < middleIndex){
        //             let offset = "left:" + (center - (commonOffset * (middleIndex - i))).toString() + "px";
        //             child.setAttribute("style", offset);
        //         } else {
        //             let offset = "left:" + (center + (commonOffset * (i - middleIndex))).toString() + "px";
        //             child.setAttribute("style", offset);
        //         }
        //     }
        // }


        // let first = document.getElementById(childrenIds[0]);
        // let last = document.getElementById(childrenIds[childrenIds.length-1]);
        // if(!first || !last)
        //     return;
        // let firstPos = first.getBoundingClientRect();
        // let lastPos = last.getBoundingClientRect();
        // let fullLength = (lastPos.x + lastPos.width) - (firstPos.x + firstPos.width);
        // let commonOffset = fullLength/(childrenIds.length-1);
        // if(childrenIds.length % 2 === 0){
        //     for(let i = 0; i < childrenIds.length; i++){
        //         let child = document.getElementById(childrenIds[i]);
        //         if(!child) {
        //             continue;
        //         }
        //         let childPosition = child.getBoundingClientRect();
        //         let center = parentPosition.x - childPosition.x;
        //         if(i <= childrenIds.length/2){
        //             let offset = "left:" + (center - (commonOffset * (childrenIds.length/2 - i))).toString() + "px";
        //             child.setAttribute("style", offset);
        //         } else {
        //             let offset = "left:" + (center + (commonOffset * ((i+1) - childrenIds.length/2))).toString() + "px";
        //             child.setAttribute("style", offset);
        //         }
        //     }
        // } else {
        //     for(let i = 0; i < childrenIds.length; i++){
        //         let child = document.getElementById(childrenIds[i]);
        //         if(!child) {
        //             continue;
        //         }
        //         let childPosition = child.getBoundingClientRect();
        //         let center = parentPosition.x - childPosition.x;
        //         let middleIndex = ~~(childrenIds.length/2);
        //         if(i === middleIndex){
        //             let offset = "left:" + center.toString() + "px";
        //             child.setAttribute("style", offset);
        //         }else if(i < middleIndex){
        //             let offset = "left:" + (center - (commonOffset * (middleIndex - i))).toString() + "px";
        //             child.setAttribute("style", offset);
        //         } else {
        //             let offset = "left:" + (center + (commonOffset * (i - middleIndex))).toString() + "px";
        //             child.setAttribute("style", offset);
        //         }
        //     }
        // }
    }

    drawLineConnection(parentId: string, childId: string, lineId1: string, lineId2: string, lineId3: string) {
        let top = document.getElementById(parentId);
        let child = document.getElementById(childId);
        let line1 = document.getElementById(lineId1);
        let line2 = document.getElementById(lineId2);
        let line3 = document.getElementById(lineId3);
        let childPos = child?.getBoundingClientRect();
        let parentPos = top?.getBoundingClientRect();
        console.log(parentPos)
        if (!line1 || !line2 || !line3 || !childPos || !parentPos){
            console.log("drawing error");
            return;
        }

        let childVerticalLineLength = 30;
        let x1Offset = childPos.left - childPos.height + childPos.width/5;
        let y1Offset = childPos.top - childPos.height/2;
        let x2Offset = x1Offset;
        let y2Offset = y1Offset - childVerticalLineLength;
        let connectionX1 = x2Offset;
        let connectionY1 = y2Offset; 
        let x1 = x1Offset.toString();
        let y1 = y1Offset.toString();
        let x2 = x2Offset.toString();
        let y2 = y2Offset.toString();
        line2.setAttribute('x1', x1);
        line2.setAttribute('y1', y1);
        line2.setAttribute('x2', x1);
        line2.setAttribute('y2', y2);

        let parentVerticalLineLength = 50;
        x1Offset = parentPos.left - parentPos.height + parentPos.width/5;
        y1Offset = parentPos.top + parentPos.height/6; 
        x2Offset = x1Offset;
        y2Offset = y1Offset + parentVerticalLineLength;
        let connectionX2 = x2Offset;
        let connectionY2 = y2Offset; 
        x1 = x1Offset.toString();
        y1 = y1Offset.toString();
        x2 = x2Offset.toString();
        y2 = y2Offset.toString();
        line3.setAttribute('x1', x1);
        line3.setAttribute('y1', y1);
        line3.setAttribute('x2', x2);
        line3.setAttribute('y2', y2);

        x1 = connectionX1.toString();
        y1 = connectionY1.toString();
        x2 = connectionX2.toString();
        y2 = connectionY2.toString();
        line1.setAttribute('x1', x1);
        line1.setAttribute('y1', y1);
        line1.setAttribute('x2', x2);
        line1.setAttribute('y2', y2);
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

    findRelationships(levels: Node[][]): string[] {
        let relationships: string[] = [];
        for (let i = 0; i < levels[0].length; i++) {
            relationships.push("topLevel" + ",0" + i.toString());
        }
        for (let i = 0; i < levels.length; i++) {
            for (let k = 0; k < levels[i].length; k++) {
                let node = levels[i][k];
                let indexes: string[] = [];
                let currentNodeId = i.toString() + k.toString();
                node.children.forEach(child => indexes.push(currentNodeId + "," + (i + 1).toString() + (levels[i + 1].findIndex(node => node === child).toString())));
                relationships.push(...indexes)
            }
        }
        return relationships;
    }
}

import { AfterViewInit, Component, OnInit } from '@angular/core';
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
        let currentParent: string | null = null;
        let currentChildren: string[] = [];
        for (let i = 0; i < this.relationships.length; i++) {
            const relationship = this.relationships[i].split(',');
            if (currentParent === null) {
                currentParent = relationship[0];
                currentChildren.push(relationship[1]);
            } else if (currentParent !== relationship[0]) {
                this.repositionChildren(currentChildren, currentParent);
                currentParent = relationship[0];
                currentChildren = [relationship[1]];
            } else {
                currentChildren.push(relationship[1]);
            }
        }
        if (currentParent !== null)
            this.repositionChildren(currentChildren, currentParent);
        
        this.fixCollisions(this.relationships, this.hierarchyLevels);

        for (let i = 0; i < this.relationships.length; i++) {
            const relationship = this.relationships[i].split(',');
            const lineId1 = 'line' + i.toString() + '0';
            const lineId2 = 'line' + i.toString() + '1';
            const lineId3 = 'line' + i.toString() + '2';

            this.drawLineConnection(relationship[0], relationship[1], lineId1, lineId2, lineId3);
        }
    }

    repositionChildren(childrenIds: string[], parentId: string) {
        const parentPosition = document.getElementById(parentId)?.getBoundingClientRect();
        if (!parentPosition) {
            return;
        }

        let offset = '';
        if(childrenIds.length % 2 === 0){
            const middleIndex1 = childrenIds.length/2;
            const middleIndex2 = middleIndex1 -1;
            const middleChild1 = document.getElementById(childrenIds[middleIndex1]);
            const middleChild1Position = middleChild1?.getBoundingClientRect();
            const middleChild2 = document.getElementById(childrenIds[middleIndex2]);
            const middleChild2Position = middleChild2?.getBoundingClientRect();
            
            if(!middleChild1 || !middleChild1Position || !middleChild2 || !middleChild2Position)
                return;

            const middleChild1X = (middleChild1Position.left - middleChild1Position.height + middleChild1Position.width/5);
            const middleChild2X = (middleChild2Position.left - middleChild2Position.height + middleChild2Position.width/5);
            const centerPoint = middleChild2X + (middleChild1X - middleChild2X)/2;
            const parentX = parentPosition.left - parentPosition.height + parentPosition.width/5;
            const shiftAmount = parentX - centerPoint;
            offset = 'left:' + shiftAmount.toString() + 'px';
        }else{ 
            const middleIndex = ~~(childrenIds.length/2);
            const middleChild = document.getElementById(childrenIds[middleIndex]);
            const middleChildPosition = middleChild?.getBoundingClientRect();

            if(!middleChild || !middleChildPosition)
                return;

            const parentX = parentPosition.left - parentPosition.height + parentPosition.width/5;
            const childX = middleChildPosition.left - middleChildPosition.height + middleChildPosition.width/5;
            const shiftAmount = parentX - childX;
            offset = 'left:' + shiftAmount.toString() + 'px';
        }

        for(let i = 0; i < childrenIds.length; i++){
            const child = document.getElementById(childrenIds[i]);
            if(!child) {
                continue;
            }
            child.setAttribute('style', offset);
        }
    }

    fixCollisions(relationships: string[], levels: Node[][]) : void {
        const hasCollision = (pos1: DOMRect, pos2: DOMRect): boolean => {
            return !(pos1.right <= pos2.left || 
                pos1.left >= pos2.right || 
                pos1.bottom <= pos2.top || 
                pos1.top >= pos2.bottom);
        };

        const findParent = (elementId: string, relationships: string[]): string | null => {
            const relationship = relationships
                .find(r => r.split(',')[1] === elementId);
            return relationship ? relationship.split(',')[0] : null;
        };

        const findAllParents = (elementId: string, relationships: string[], parents: string[]): string[] => {
            const parent = findParent(elementId, relationships);
            if(!parent)
                return parents;
            
            parents.push(parent);
            return findAllParents(parent, relationships, parents);
        };

        const shiftElements = (elementId: string, relationships: string[]): void => {
            const parents = findAllParents(elementId, relationships, []);
            console.log(parents);
        };

        shiftElements('31', relationships);
        // for (let i = 0; i < levels.length; i++) {
        //     for (let j = 0; j < levels[i].length; j++) {
        //         const firstId = i.toString() + j.toString();
        //         const first = document.getElementById(firstId)?.getBoundingClientRect();
        //         const secondId = i.toString() + (j+1).toString();
        //         const second = document.getElementById(secondId)?.getBoundingClientRect();
        //         if(!first || !second)
        //             continue;
                
        //         if(hasCollision(first, second)){
        //             shiftElements(secondId, relationships);
        //         }
        //     }
        // }
    }

    drawLineConnection(parentId: string, childId: string, lineId1: string, lineId2: string, lineId3: string) {
        const top = document.getElementById(parentId);
        const child = document.getElementById(childId);
        const line1 = document.getElementById(lineId1);
        const line2 = document.getElementById(lineId2);
        const line3 = document.getElementById(lineId3);
        const childPos = child?.getBoundingClientRect();
        const parentPos = top?.getBoundingClientRect();
        if (!line1 || !line2 || !line3 || !childPos || !parentPos){
            return;
        }
        const parentEdge = parentPos.top + parentPos.height/6;
        const childEdge = childPos.top - childPos.height/2;
        const verticalLineLength = (childEdge-parentEdge)/2;

        let x1Offset = childPos.left - childPos.height + childPos.width/5;
        let y1Offset = childEdge;
        let x2Offset = x1Offset;
        let y2Offset = y1Offset - verticalLineLength;
        const connectionX1 = x2Offset;
        const connectionY1 = y2Offset; 
        let x1 = x1Offset.toString();
        let y1 = y1Offset.toString();
        let x2 = x2Offset.toString();
        let y2 = y2Offset.toString();
        line2.setAttribute('x1', x1);
        line2.setAttribute('y1', y1);
        line2.setAttribute('x2', x1);
        line2.setAttribute('y2', y2);

        x1Offset = parentPos.left - parentPos.height + parentPos.width/5;
        y1Offset = parentEdge; 
        x2Offset = x1Offset;
        y2Offset = y1Offset + verticalLineLength;
        const connectionX2 = x2Offset;
        const connectionY2 = y2Offset; 
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
        const levels: Node[][] = [];
        const addNodesToLevel = (node: Node, currentLevel: number) => {
            if (!levels[currentLevel]) {
                levels.push([]);
            }
            levels[currentLevel].push(node);
            const nextLevel = currentLevel + 1;
            node.children.forEach(child => addNodesToLevel(child, nextLevel));
        };
        hierarchy.nodes.forEach(node => addNodesToLevel(node, 0));
        return levels;
    }

    findRelationships(levels: Node[][]): string[] {
        const relationships: string[] = [];
        for (let i = 0; i < levels[0].length; i++) {
            relationships.push('topLevel' + ',0' + i.toString());
        }
        for (let i = 0; i < levels.length; i++) {
            for (let k = 0; k < levels[i].length; k++) {
                const node = levels[i][k];
                const indexes: string[] = [];
                const currentNodeId = i.toString() + k.toString();
                node.children.forEach(child => indexes.push(currentNodeId + ',' + (i + 1).toString() + (levels[i + 1].findIndex(node => node === child).toString())));
                relationships.push(...indexes);
            }
        }
        return relationships;
    }
}

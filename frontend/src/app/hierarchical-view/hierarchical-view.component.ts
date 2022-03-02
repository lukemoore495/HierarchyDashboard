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

    moveRelativeElement(element: HTMLElement, offset: number){
        const defaultOffset = 'left:' + '0' + 'px';
        const currentLeft = element.getBoundingClientRect().left;
        element.setAttribute('style', defaultOffset);
        const defaultLeft = element.getBoundingClientRect().left;
        const finalOffset = 'left:' + (currentLeft - defaultLeft + offset).toString() + 'px';
        element.setAttribute('style', finalOffset);
    }

    repositionChildren(childrenIds: string[], parentId: string) {
        const parentPosition = document.getElementById(parentId)?.getBoundingClientRect();
        if (!parentPosition) {
            return;
        }

        let shiftAmount;
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
            shiftAmount = parentX - centerPoint;
        }else{ 
            const middleIndex = ~~(childrenIds.length/2);
            const middleChild = document.getElementById(childrenIds[middleIndex]);
            const middleChildPosition = middleChild?.getBoundingClientRect();

            if(!middleChild || !middleChildPosition)
                return;

            const parentX = parentPosition.left - parentPosition.height + parentPosition.width/5;
            const childX = middleChildPosition.left - middleChildPosition.height + middleChildPosition.width/5;
            shiftAmount = parentX - childX;
        }

        for(let i = 0; i < childrenIds.length; i++){
            const child = document.getElementById(childrenIds[i]);
            if(!child) {
                continue;
            }
            this.moveRelativeElement(child, shiftAmount);
        }
    }

    hasCollision (pos1: DOMRect, pos2: DOMRect): boolean {
        return !(pos1.right <= pos2.left || 
            pos1.left >= pos2.right || 
            pos1.bottom <= pos2.top || 
            pos1.top >= pos2.bottom);
    };

    findRowCollision (row: string[]): string | null {
        for(const id of row) {
            const elementPos = document.getElementById(id)?.getBoundingClientRect();
            if(!elementPos)
                continue;
            for(const currentId of row){
                if(currentId === id)
                    continue;

                const currentPos = document.getElementById(currentId)?.getBoundingClientRect();

                if(!currentPos)
                    continue;

                if(this.hasCollision(elementPos, currentPos)){
                    return currentId;
                }
            }
        }
        return null;
    };

    findParent (elementId: string, relationships: string[]): string | null {
        const relationship = relationships
            .find(r => r.split(',')[1] === elementId);
        return relationship ? relationship.split(',')[0] : null;
    };

    findChildren (elementId: string, relationships: string[]): string[] {
        const childrenIds = relationships
            .filter(r => r.split(',')[0] === elementId)
            .map(r => r.split(',')[1]);
        return childrenIds;
    };

    findDescendants (elementId: string, relationships: string[], children: string[]) {
        const newChildren = this.findChildren(elementId, relationships);
        if(newChildren.length === 0)
            return children;
        
        children.push(...newChildren);
        newChildren.forEach(child => children.push(...this.findDescendants(child, relationships, [])));
        return children;
    };
    
    findAllElementsToShift (elementId: string, relationships: string[]): string[] {
        const findElementsToShift = (elementId: string, relationships: string[], elements: string[]): string[] => {
            const parent = this.findParent(elementId, relationships);
            if(!parent)
                return elements;
            
            const allChildren = this.findChildren(parent, relationships);
            const elementIndex = allChildren.indexOf(elementId);
            const children = allChildren.slice(elementIndex);
      
            elements.push(...children);
            children
                .filter(child => child != elementId)
                .forEach(child => elements.push(...this.findDescendants(child, relationships, [])));
            
            if(parent !== 'topLevel') {
                return findElementsToShift(parent, relationships, elements);
            }
            
            if(elementIndex <= ~~(allChildren.length/2)){
                elements.push(parent);
            }
    
            return elements;
        };

        const children = this.findDescendants(elementId, relationships, []);
        const elements = findElementsToShift(elementId, relationships, children);
        return elements;
    };
    
    shiftElements(elementId: string, relationships: string[]): void {
        const elements = this.findAllElementsToShift(elementId, relationships);
        for(const elementId of elements) { 
            const element = document.getElementById(elementId);
            const pos = element?.getBoundingClientRect();
            if(!element || !pos)
                continue;

            this.moveRelativeElement(element, pos.height);
        }
    };

    fixCollisions(relationships: string[], levels: Node[][]) : void {
        for (let i = 0; i < levels.length; i++) {
            const levelIds: string[] = [];
            for (let j = 0; j < levels[i].length; j++) {
                levelIds.push(i.toString() + j.toString());
            }
            let collidingId = this.findRowCollision(levelIds);
            while(collidingId !== null){
                this.shiftElements(collidingId, relationships);
                collidingId = this.findRowCollision(levelIds);
            }
        }
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

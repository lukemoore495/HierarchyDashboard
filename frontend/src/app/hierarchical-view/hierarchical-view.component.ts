import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
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
    hierarchyName?: string;
    hierarchyLevels: Node[][] = [];
    elem: Element | null = null;
    relationships: string[] = [];
    @ViewChildren('nodes') private nodes?: QueryList<ElementRef<HTMLDivElement>>;
    @ViewChildren('lines') private lines?: QueryList<ElementRef<SVGLineElement>>;

    constructor(private store: Store<HierarchyState>) { }

    ngOnInit(): void {
        this.store.select(getSelectedHierarchy)
            .subscribe(hierarchy => {
                if (hierarchy) {
                    this.hierarchyName = hierarchy.name;
                    this.hierarchyLevels = this.sortNodesToLevels(hierarchy);
                    this.relationships = this.findRelationships(this.hierarchyLevels);
                }
            });
    }

    ngAfterViewInit() {
        for (let i = 0; i < this.relationships.length; i++) {
            const relationship = this.relationships[i].split(',');
            const parentId = relationship[0];
            const childrenIds = relationship.slice(1);
            this.repositionChildren(childrenIds, parentId);
        }
        
        this.fixCollisions(this.relationships, this.hierarchyLevels);

        this.fixOffscreenNodes(this.hierarchyLevels.length);

        for (let i = 0; i < this.relationships.length; i++) {
            const relationship = this.relationships[i].split(',');
            const parentId = relationship[0];
            const childrenIds = relationship.slice(1);
            const lineIds: string [] = [];
            for(let j = 0; j < relationship.length; j++){
                lineIds.push('line' + i.toString() + j.toString());
            }
            lineIds.push('line' + i.toString() + 'c');

            this.drawLineConnection(parentId, childrenIds, lineIds);
        }
    }

    getNodeById(id: string): HTMLDivElement | null {
        return this.nodes?.find(x => x.nativeElement.id === id)?.nativeElement ?? null;
    }

    getLineById(id: string): SVGLineElement | null {
        return this.lines?.find(x => x.nativeElement.id === id)?.nativeElement ?? null;
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
        const parentPosition = this.getNodeById(parentId)?.getBoundingClientRect();
        if (!parentPosition) {
            return;
        }

        let shiftAmount;
        if(childrenIds.length % 2 === 0){
            const middleIndex1 = childrenIds.length/2;
            const middleIndex2 = middleIndex1 -1;
            const middleChild1 = this.getNodeById(childrenIds[middleIndex1]);
            const middleChild1Position = middleChild1?.getBoundingClientRect();
            const middleChild2 = this.getNodeById(childrenIds[middleIndex2]);
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
            const middleChild = this.getNodeById(childrenIds[middleIndex]);
            const middleChildPosition = middleChild?.getBoundingClientRect();

            if(!middleChild || !middleChildPosition)
                return;

            const parentX = parentPosition.left - parentPosition.height + parentPosition.width/5;
            const childX = middleChildPosition.left - middleChildPosition.height + middleChildPosition.width/5;
            shiftAmount = parentX - childX;
        }

        for(let i = 0; i < childrenIds.length; i++){
            const child = this.getNodeById(childrenIds[i]);
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
            const elementPos = this.getNodeById(id)?.getBoundingClientRect();
            if(!elementPos)
                continue;

            for(const currentId of row){
                if(currentId === id)
                    continue;

                const currentPos = this.getNodeById(currentId)?.getBoundingClientRect();

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
            .find(r => r.split(',').some(x => x  === elementId));
        return relationship ? relationship.split(',')[0] : null;
    };

    findChildren (elementId: string, relationships: string[]): string[] {
        const relationship = relationships
            .find(r => r.split(',')[0] === elementId);
        const childrenIds = relationship?.split(',').slice(1) ?? [];
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
            const element = this.getNodeById(elementId);
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

    fixOffscreenNodes(levels: number): void {
        const getOffset = (relativeElement: HTMLElement) => {
            const current = relativeElement?.getBoundingClientRect().left ?? 0;
            relativeElement?.setAttribute('style', 'left:' + '0' + 'px');
            const defaultLeft = relativeElement?.getBoundingClientRect().left ?? 0;
            const offset = current-defaultLeft;
            relativeElement?.setAttribute('style', 'left:' + offset.toString() + 'px');
            return offset;
        };

        for(let i = 0; i < levels; i++){
            const nodeId = i.toString() + '0';
            const node = this.getNodeById(nodeId);
            if(!node)
                continue;

            const offset = getOffset(node);
            if(offset < 0) {
                this.shiftElements(nodeId, this.relationships);
            }
        }
    }

    drawLineConnection(parentId: string, childrenIds: string[], lineIds: string[]): void {
        const findBottomCenterEdge = (position: DOMRect): number => {
            return position.top + position.height/15;
        };

        const findTopCenterEdge = (position: DOMRect): number => {
            return position.top - position.height/2;
        };

        const parent = this.getNodeById(parentId);
        const parentPos = parent?.getBoundingClientRect();
        if(!parent || !parentPos)
            return;
        
        const children: HTMLDivElement[] = [];
        const lines: SVGLineElement[] = [];
        for(const childId of childrenIds){
            const child = this.getNodeById(childId);
            if(child)
                children.push(child);
        }
        for(const lineId of lineIds){
            const line = this.getLineById(lineId);
            if(line)
                lines.push(line);
        }

        const parentEdge = findBottomCenterEdge(parentPos);
        let verticalLineLength: number| null = null;   
        let connectionX1: string | null = null;
        let connectionX2: string | null = null;
        let connectionY: string | null = null;
        for(const child of children){
            const childPos = child?.getBoundingClientRect();
            const line = lines.pop();
            if(!line)
                break;

            if(!childPos)
                continue;
            
            const childEdge = findTopCenterEdge(childPos);

            if(!verticalLineLength)
                verticalLineLength = (childEdge-parentEdge)/2;

            const x1Offset = childPos.left - childPos.height + childPos.width/5;
            const y1Offset = childEdge;
            const y2Offset = y1Offset - verticalLineLength;
            const x1 = x1Offset.toString();
            const y1 = y1Offset.toString();
            const y2 = y2Offset.toString();

            if(child === children[0]){
                connectionX1 = x1;
                connectionY = y2;
            }
            if(child === children[children.length -1]){
                connectionX2 = x1;
            }

            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x1);
            line.setAttribute('y2', y2);       
        }

        const parentLine = lines.pop();
        if(!parentLine || !verticalLineLength)
            return;

        const parentX1Offset = parentPos.left - parentPos.height + parentPos.width/5;
        const parentY1Offset = parentEdge; 
        const parentX2Offset = parentX1Offset;
        const parentY2Offset = parentY1Offset + verticalLineLength;
        const parentX1 = parentX1Offset.toString();
        const parentY1 = parentY1Offset.toString();
        const parentX2 = parentX2Offset.toString();
        const parentY2 = parentY2Offset.toString();
        parentLine.setAttribute('x1', parentX1);
        parentLine.setAttribute('y1', parentY1);
        parentLine.setAttribute('x2', parentX2);
        parentLine.setAttribute('y2', parentY2);

        const connectingLine = lines.pop();
        if(!connectingLine || !connectionX1 || !connectionX2 || !connectionY)
            return;

        connectingLine.setAttribute('x1', connectionX1);
        connectingLine.setAttribute('y1', connectionY);
        connectingLine.setAttribute('x2', connectionX2);
        connectingLine.setAttribute('y2', connectionY);
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
        let firstLevel = 'topLevel';
        for (let i = 0; i < levels[0].length; i++) {
            firstLevel += ',0' + i.toString();
        }
        relationships.push(firstLevel);

        for (let i = 0; i < levels.length; i++) {
            for (let k = 0; k < levels[i].length; k++) {
                const node = levels[i][k];
                const currentNodeId = i.toString() + k.toString();
                let currentLevel = currentNodeId;
                node.children.forEach(child => currentLevel += (',' + (i + 1).toString() + (levels[i + 1].findIndex(node => node === child).toString())));
                if(currentLevel.length > currentNodeId.length)
                    relationships.push(currentLevel);
            }
        }
        return relationships;
    }
}

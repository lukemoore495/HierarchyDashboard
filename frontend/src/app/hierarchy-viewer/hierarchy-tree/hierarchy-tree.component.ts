import { Component, ElementRef, Input, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Hierarchy, MeasurementDefinition, Node } from 'src/app/Hierarchy';
import { OnInit } from '@angular/core';
import { TreeNode } from './TreeNode';

@Component({
    selector: 'app-hierarchy-tree',
    templateUrl: './hierarchy-tree.component.html',
    styleUrls: ['./hierarchy-tree.component.scss']
})
export class HierarchyTreeComponent implements OnInit{
    @Input() hierarchy: Hierarchy | null = null;
    defaultId = '';
    hierarchyLevels: TreeNode[][] = [];
    elem: Element | null = null;
    relationships: string[] = [];
    viewBoxHeight = 20000;
    viewBoxWidth = 20000;
    @ViewChildren('nodes') private nodes?: QueryList<ElementRef<HTMLDivElement>>;
    @ViewChild('svg') svg?: ElementRef;

    constructor(private renderer: Renderer2) {}

    ngOnInit(){
        if(!this.hierarchy) {
            return;
        }

        this.hierarchyLevels = this.sortNodesToLevels(this.hierarchy);
        this.relationships = this.findRelationships(this.hierarchyLevels);
      
        this.viewBoxHeight = this.hierarchyLevels.length * 250;
        let maxWidth = 0;
        this.hierarchyLevels.forEach(level => {
            if(level.length > maxWidth){
                maxWidth = level.length;
            }
        });
        this.viewBoxWidth = (maxWidth + 1) * 400;
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

        this.drawAllLineConnections(this.relationships);
    }

    nodeToTreeNode(node: Node): TreeNode {
        const children: TreeNode[] = [];
        children.push(...node.children.map(node => this.nodeToTreeNode(node)));
        children.push(...node.measurements.map(measurement => this.measurementDefinitionToTreeNode(measurement)));
        return {
            id: node.id,
            name: node.name,
            weight: node.weight,
            measurementNode: false,
            children: children
        };
    }

    measurementDefinitionToTreeNode(measurementDefinition: MeasurementDefinition): TreeNode {
        return {
            id: measurementDefinition.id,
            name: measurementDefinition.name,
            measurementNode: true,
            children: []
        };
    }

    canBeWeighted(node: TreeNode){
        return node.children.some(child => !child.measurementNode);
    }

    sortNodesToLevels(hierarchy: Hierarchy): TreeNode[][] {
        const levels: TreeNode[][] = [];
        const addNodesToLevel = (node: TreeNode, currentLevel: number) => {
            if (!levels[currentLevel]) {
                levels.push([]);
            }
            levels[currentLevel].push(node);
            const nextLevel = currentLevel + 1;
            node.children.forEach(child => addNodesToLevel(child, nextLevel));
        };
        hierarchy.nodes.forEach(node => {
            const treeNode = this.nodeToTreeNode(node);
            addNodesToLevel(treeNode, 0);
        });
        return levels;
    }

    findRelationships(levels: TreeNode[][]): string[] {
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
                node.children.forEach(child => currentLevel += (',' + (i + 1).toString()
                     + (levels[i + 1].findIndex(node => node === child).toString())));
                if(currentLevel.length > currentNodeId.length){
                    relationships.push(currentLevel);
                }
            }
        }
        return relationships;
    }

    getNodeById(id: string): HTMLDivElement | null {
        return this.nodes?.find(x => x.nativeElement.id === id)?.nativeElement ?? null;
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

            const middleChild1X = middleChild1Position.left + middleChild1Position.width/2;
            const middleChild2X = middleChild2Position.left + middleChild2Position.width/2;
            const centerPoint = middleChild2X + (middleChild1X - middleChild2X)/2;
            const parentX = parentPosition.left + parentPosition.width/2;
            shiftAmount = parentX - centerPoint;
        }else{ 
            const middleIndex = ~~(childrenIds.length/2);
            const middleChild = this.getNodeById(childrenIds[middleIndex]);
            const middleChildPosition = middleChild?.getBoundingClientRect();

            if(!middleChild || !middleChildPosition)
                return;

            const parentX = parentPosition.left + parentPosition.width/2;
            const childX = middleChildPosition.left + middleChildPosition.width/2;
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

    fixCollisions(relationships: string[], levels: TreeNode[][]) : void {
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

    moveRelativeElement(element: HTMLElement, offset: number){
        const defaultOffset = 'left:' + '0' + 'px';
        const currentLeft = element.getBoundingClientRect().left;
        element.setAttribute('style', defaultOffset);
        const defaultLeft = element.getBoundingClientRect().left;
        const finalOffset = 'left:' + (currentLeft - defaultLeft + offset).toString() + 'px';
        element.setAttribute('style', finalOffset);
    }

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
  
    findParent (elementId: string, relationships: string[]): string | null {
        const relationship = relationships
            .find(r => r.split(',').some(x => x  === elementId));
        return relationship ? relationship.split(',')[0] : null;
    };

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

    drawAllLineConnections(relationships: string[]){
        for (let i = 0; i < relationships.length; i++) {
            const relationship = relationships[i].split(',');
            const parentId = relationship[0];
            const childrenIds = relationship.slice(1);
            this.drawLineConnection(parentId, childrenIds);
        }
    }

    drawLineConnection(parentId: string, childrenIds: string[]): void {
        const parent = this.getNodeById(parentId);
        const parentPos = parent?.getBoundingClientRect();
        if(!parent || !parentPos)
            return;
      
        const children: HTMLDivElement[] = [];
        for(const childId of childrenIds){
            const child = this.getNodeById(childId);
            if(child)
                children.push(child);
        }

        const parentEdge = parentPos.top + parentPos.height/2;

        let verticalLineLength: number| null = null;   
        let connectionX1: number | null = null;
        let connectionX2: number | null = null;
        let connectionY: number | null = null;
        for(const child of children){
            const childPos = child?.getBoundingClientRect();

            if(!childPos)
                continue;
          
            const childEdge = childPos.top + childPos.height/2;;

            if(!verticalLineLength)
                verticalLineLength = (childEdge-parentEdge)/2;

            const x1 = childPos.left + childPos.width/2;
            const y1 = childEdge;
            const y2 = y1 - verticalLineLength;

            if(child === children[0]){
                connectionX1 = x1;
                connectionY = y2;
            }
            if(child === children[children.length -1]){
                connectionX2 = x1;
            }

            this.drawLine(x1, y1, x1, y2);
        }

        if(!verticalLineLength)
            return;

        const parentX1 = parentPos.left + parentPos.width/2;
        const parentY1 = parentEdge; 
        const parentX2 = parentX1;
        const parentY2 = parentY1 + verticalLineLength;
        this.drawLine(parentX1, parentY1, parentX2, parentY2);

        if(!connectionX1 || !connectionX2 || !connectionY)
            return;

        this.drawLine(connectionX1, connectionY, connectionX2, connectionY);
    }
  
    drawLine(x1: number, y1: number, x2: number, y2: number){
        const DOMCoordinateToSVG = (svg: ElementRef, x: number, y: number): SVGPoint => {
            const point = svg?.nativeElement.createSVGPoint();
            point.x = x;
            point.y = y;
            return point.matrixTransform(svg?.nativeElement.getScreenCTM().inverse());
        };

        if(!this.svg)
            return;

        const svgP1 = DOMCoordinateToSVG(this.svg, Number(x1), Number(y1));
        const svgP2 = DOMCoordinateToSVG(this.svg, Number(x2), Number(y2));

        const line = this.renderer.createElement('line', this.svg?.nativeElement.namespaceURI);
        line.setAttributeNS(null, 'x1', svgP1.x);
        line.setAttributeNS(null, 'y1', svgP1.y);
        line.setAttributeNS(null, 'x2', svgP2.x);
        line.setAttributeNS(null, 'y2', svgP2.y);
        line.setAttributeNS(null, 'stroke', 'black');
        this.renderer.appendChild(this.svg?.nativeElement, line);
    }

}

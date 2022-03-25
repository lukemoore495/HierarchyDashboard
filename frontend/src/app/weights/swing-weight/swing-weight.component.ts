import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Node } from '../../Hierarchy';

@Component({
    selector: 'app-swing-weight',
    templateUrl: './swing-weight.component.html',
    styleUrls: ['./swing-weight.component.scss']
})
export class SwingWeightComponent implements OnInit {
    @Input() node$?: Observable<Node | null>;
    node: Node | null = null;
    children: Node[] = [];
    displayedColumns: string[] = ['name', 'weight'];
    matrix = ['100', '75', '50',
        '75', '50', '25',
        '50', '25', '10'];
    columns = ['High', 'Medium', 'Low'];
    rows = ['High', 'Medium', 'Low'];

    ngOnInit(): void {
        if (!this.node$) {
            return;
        }

        this.node$
            .subscribe(node => {
                this.node = node;
                this.children = node?.children ?? [];
            });
    }

    constructor(private ElByClassName: ElementRef) { }

    onDragEnded(event: any) {
        let element = event.source.getRootElement();
        let grid: any = (<HTMLElement>this.ElByClassName.nativeElement).querySelector(
            '.grid-list');
        if (grid == null)
            return; // grid is not found

        let relativePosition = this.getPosition(element.getBoundingClientRect(), grid.getBoundingClientRect());

        if (relativePosition == null) {
            return; // element is not in the grid
        }

        // node id, x and y positions relative to the grid
        console.log('id: ' + element.id + ' x: ' + relativePosition.left, 'y: ' + relativePosition.top);
    }

    getPosition(element: DOMRect, parent: DOMRect): { left: string, top: string } | null {
        // return null if element is not in the grid
        if (element.top + element.height < parent.top
            || element.bottom - element.height > parent.bottom
            || element.left + element.width < parent.left
            || element.right - element.width > parent.right) {
            return null;
        }

        // return the center position relative to the parent
        let x = ((element.left + (element.width / 2) - parent.left) * 100 / parent.width).toFixed(2);
        let y = ((element.top + (element.height / 2) - parent.top) * 100 / parent.height).toFixed(2);
        return { top: y, left: x };
    }

}
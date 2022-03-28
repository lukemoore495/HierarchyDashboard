import { Component, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { OnInit } from '@angular/core';
import { Node } from '../../Hierarchy';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-swing-weight',
    templateUrl: './swing-weight.component.html',
    styleUrls: ['./swing-weight.component.scss']
})
export class SwingWeightComponent implements OnInit{
    @Input() node$?: Observable<Node | null>;
    node: Node | null = null;
    children: Node[] = [];
    displayedColumns: string[] = ['name', 'weight'];
    matrix =  ['100', '75', '50', 
        '75', '50', '25', 
        '50', '25', '10'];
    columns =  ['High', 'Medium', 'Low'];
    rows =  ['High', 'Medium', 'Low'];

    ngOnInit(): void {
        if(!this.node$){
            return;
        }

        this.node$
            .subscribe(node => {
                this.node = node;
                this.children = node?.children ?? [];
            });
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.children, event.previousIndex, event.currentIndex);
    }
}

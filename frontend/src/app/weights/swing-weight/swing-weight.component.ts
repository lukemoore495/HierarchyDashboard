import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { Node } from '../../Hierarchy';
import { Observable } from 'rxjs';
import { SwingWeight } from './SwingWeight';

@Component({
    selector: 'app-swing-weight',
    templateUrl: './swing-weight.component.html',
    styleUrls: ['./swing-weight.component.scss']
})
export class SwingWeightComponent implements OnInit{
    @Input() node$?: Observable<Node | null>;
    node: Node | null = null;
    children: Node[] = [];
    childrenNames: string[] = [];
    emptyDrop: Node[][] = [];
    displayedColumns: string[] = ['name', 'weight'];
    matrix =  ['1000', '440', '230', '100', 
        '750', '380', '210', '90', 
        '500', '300', '170', '70',
        '250', '170', '100', '50'];
    numberOfColumns = 4;
    columnLabels =  ['Extremely Important', 'Very Important', 'Important', 'Less Important'];
    rowLabels =  ['Very High', 'High', 'Medium', 'Low'];

    ngOnInit(): void {
        for(let i = 0; i < this.matrix.length; i++){
            this.emptyDrop.push([]);
        }

        if (!this.node$) {
            return;
        }

        this.node$
            .subscribe(node => {
                this.node = node;
                this.children = node?.children ? [...node.children] : [];
                this.childrenNames = this.children.map(node => node.name);
            });
    }

    drop(event: CdkDragDrop<Node[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem<Node>(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );
        }
    }

    onSave(){
        const swingWeights: SwingWeight[] = [];
        this.emptyDrop.forEach((dropList, index) => {
            if(dropList.length > 0){
                swingWeights.push({
                    swingValue: Number(this.matrix[index]),
                    nodeIds: dropList.map(node => node.id)
                });
            }
        });

        //replace with an api call in the future
        console.log(swingWeights);
    }
}

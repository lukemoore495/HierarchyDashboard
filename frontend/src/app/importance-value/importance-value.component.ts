import { Component } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-importance-value',
  templateUrl: './importance-value.component.html',
  styleUrls: ['./importance-value.component.scss']
})
export class ImportanceValueComponent {
  weights = [
    'Security',
    'Justice',
    'Economic Opportunities',
    'Education',
    'Socio Economic',
  ];
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.weights, event.previousIndex, event.currentIndex);
  }
}

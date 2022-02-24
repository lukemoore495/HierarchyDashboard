import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatGridListModule } from '@angular/material/grid-list';
import { DragDropModule} from '@angular/cdk/drag-drop';
import { ImportanceValueComponent } from "./importance-value.component";

@NgModule({
    declarations: [
        ImportanceValueComponent
    ],
    imports: [
        CommonModule,
        MatGridListModule,
        DragDropModule
    ],
    exports: [
        ImportanceValueComponent
    ]
  })
export class ImportanceValueModule { }

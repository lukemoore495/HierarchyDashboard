import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from '@angular/material/card';
import { HierarchicalViewComponent } from "./hierarchical-view.component";
import { MatListModule } from "@angular/material/list";

@NgModule({
    declarations: [
        HierarchicalViewComponent
    ],
    imports: [
        CommonModule,
        MatCardModule,
        MatListModule
    ],
    exports: [
        HierarchicalViewComponent
    ]
  })
export class HierarchicalViewModule { }

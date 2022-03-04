import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { HierarchicalViewComponent } from './hierarchical-view.component';

@NgModule({
    declarations: [
        HierarchicalViewComponent
    ],
    imports: [
        CommonModule,
        MatCardModule
    ],
    exports: [
        HierarchicalViewComponent
    ]
})
export class HierarchicalViewModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { HierarchicalViewComponent } from './hierarchical-view.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { HierarchyTreeComponent } from './hierarchy-tree/hierarchy-tree.component';

@NgModule({
    declarations: [
        HierarchicalViewComponent,
        HierarchyTreeComponent
    ],
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatFormFieldModule,
        MatTooltipModule,
        RouterModule
    ],
    exports: [
        HierarchicalViewComponent
    ]
})
export class HierarchicalViewModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { HierarchicalViewComponent, CreateHierarchyDialog, DeleteHierarchyDialog, ImportExportHierarchyDialog } from './hierarchical-view.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { HierarchyTreeComponent } from './hierarchy-tree/hierarchy-tree.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
    declarations: [
        HierarchicalViewComponent,
        HierarchyTreeComponent,
        CreateHierarchyDialog,
        DeleteHierarchyDialog,
        ImportExportHierarchyDialog
    ],
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatFormFieldModule,
        MatTooltipModule,
        RouterModule,
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatTabsModule
    ],
    exports: [
        HierarchicalViewComponent
    ],
    entryComponents: [CreateHierarchyDialog, DeleteHierarchyDialog, ImportExportHierarchyDialog]
})
export class HierarchicalViewModule { }

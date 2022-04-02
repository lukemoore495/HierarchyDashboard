import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { HierarchyViewerComponent } from './hierarchy-viewer.component';
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
import { CreateHierarchyDialogComponent } from './create-hierarchy-dialog/create-hierarchy-dialog.component';
import { DeleteHierarchyDialogComponent } from './delete-hierarchy-dialog/delete-hierarchy-dialog.component';
import { ImportExportHierarchyDialogComponent } from './import-export-hierarchy-dialog/import-export-hierarchy-dialog.component';

@NgModule({
    declarations: [
        HierarchyViewerComponent,
        HierarchyTreeComponent,
        CreateHierarchyDialogComponent,
        DeleteHierarchyDialogComponent,
        ImportExportHierarchyDialogComponent
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
    exports: [HierarchyViewerComponent]
})
export class HierarchyViewerModule { }

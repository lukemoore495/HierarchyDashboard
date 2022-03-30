import { HierarchyRequest } from './../hierarchy.service';
import { Component, OnDestroy, Renderer2 } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Hierarchy, HierarchyListItem } from '../Hierarchy';
import { getHierarchies, getSelectedHierarchy } from '../state';
import { createHierarchy, deleteHierarchy, setSelectedHierarchy } from '../state/hierarchy.actions';
import { HierarchyState } from '../state/hierarchy.reducer';
import { MatSelectChange } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { ImportExportHierarchyDialogComponent } from './import-export-hierarchy-dialog/import-export-hierarchy-dialog.component';
import { DeleteHierarchyDialogComponent } from './delete-hierarchy-dialog/delete-hierarchy-dialog.component';
import { CreateHierarchyDialogComponent } from './create-hierarchy-dialog/create-hierarchy-dialog.component';

@Component({
    selector: 'app-hierarchy-viewer',
    templateUrl: './hierarchy-viewer.component.html',
    styleUrls: ['./hierarchy-viewer.component.scss']
})
export class HierarchyViewerComponent implements OnDestroy {
    selectedHierarchy: Hierarchy | null = null;
    subscriptions: Subscription[] = [];
    hierarchies$?: Observable<HierarchyListItem[]>;

    constructor(public dialog: MatDialog, private store: Store<HierarchyState>, private renderer: Renderer2) {
        const selectedHierarchySub = this.store.select(getSelectedHierarchy)
            .subscribe(hierarchy => {
                if (hierarchy) {
                    this.selectedHierarchy = hierarchy;
                    return;
                }
            });
        this.subscriptions.push(selectedHierarchySub);
         

        this.hierarchies$ = this.store.select(getHierarchies);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    deleteHierarchy() {
        if (this.selectedHierarchy) {
            this.store.dispatch(deleteHierarchy({ hierarchyId: this.selectedHierarchy.id }));
        }
    }

    onSelect(event: MatSelectChange) {
        this.selectedHierarchy = null;
        this.store.dispatch(setSelectedHierarchy({ selectedHierarchyId: event.value }));
    }

    createHierarchyDialog() {
        const dialogRef = this.dialog.open(CreateHierarchyDialogComponent, {
            data: { name: '', description: '' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result != null && result.event == 'Create') {
                this.selectedHierarchy = null;
                const hierarchyRequest: HierarchyRequest = {
                    name: result.name, description: result.description, nodes: [], alternatives: []
                };
                this.store.dispatch(createHierarchy({ hierarchy: hierarchyRequest }));
            }
        });
    }

    deleteHierarchyDialog() {

        const dialogRef = this.dialog.open(DeleteHierarchyDialogComponent, {
            data: { name: this.selectedHierarchy ? this.selectedHierarchy.name : '' }
        });

        dialogRef.afterClosed().subscribe(result => {

            if (result != null && result.event == 'Delete') {
                this.deleteHierarchy();
                this.selectedHierarchy = null;
            }
        });
    }

    importExportHierarchyDialog() {
        const dialogRef = this.dialog.open(ImportExportHierarchyDialogComponent, {
            data: { name: '', description: '', hierarchy: this.selectedHierarchy }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result != null && result.event == 'Import') {
                const importFile: File = result.file;

                const fileReader = new FileReader();
                fileReader.readAsText(importFile, 'UTF-8');
                fileReader.onload = () => {
                    const hierarchyRequest: HierarchyRequest = JSON.parse(fileReader.result as string);
                    this.selectedHierarchy = null;

                    //The exported file contains ids and icons, so we need to fix that on import or export
                    this.store.dispatch(createHierarchy({ hierarchy: hierarchyRequest }));
                };
                fileReader.onerror = (error) => {
                    console.log(error);
                };
            }
        });
    }
}

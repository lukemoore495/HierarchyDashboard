import { Component, ComponentRef, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Hierarchy, HierarchyListItem } from '../Hierarchy';
import { getHierarchies, getSelectedHierarchy } from '../state';
import { setSelectedHierarchy } from '../state/hierarchy.actions';
import { HierarchyState } from '../state/hierarchy.reducer';
import { MatSelectChange } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { ImportExportHierarchyDialogComponent } from './import-export-hierarchy-dialog/import-export-hierarchy-dialog.component';
import { DeleteHierarchyDialogComponent } from './delete-hierarchy-dialog/delete-hierarchy-dialog.component';
import { CreateHierarchyDialogComponent } from './create-hierarchy-dialog/create-hierarchy-dialog.component';
import { HierarchyTreeComponent } from './hierarchy-tree/hierarchy-tree.component';
import { DeleteHierarchyData } from './delete-hierarchy-dialog/DeleteHierarchyData';

@Component({
    selector: 'app-hierarchy-viewer',
    templateUrl: './hierarchy-viewer.component.html',
    styleUrls: ['./hierarchy-viewer.component.scss']
})
export class HierarchyViewerComponent implements OnDestroy {
    selectedHierarchy: Hierarchy | null = null;
    subscriptions: Subscription[] = [];
    hierarchies$?: Observable<HierarchyListItem[]>;

    @ViewChild('treeContainer', { read: ViewContainerRef }) treeContainer?: ViewContainerRef;
    tree: ComponentRef<HierarchyTreeComponent> | null = null;

    constructor(public dialog: MatDialog, private store: Store<HierarchyState>) {
        const selectedHierarchySub = this.store.select(getSelectedHierarchy)
            .subscribe(hierarchy => {
                if (hierarchy?.id != this.selectedHierarchy?.id) {
                    this.removeTree();
                }
                if (hierarchy) {
                    this.selectedHierarchy = hierarchy;
                    this.createTree();
                    return;
                }
            });
        this.subscriptions.push(selectedHierarchySub);


        this.hierarchies$ = this.store.select(getHierarchies);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    onSelect(event: MatSelectChange) {
        this.store.dispatch(setSelectedHierarchy({ selectedHierarchyId: event.value }));
    }

    createHierarchyDialog() {
        this.dialog.open(CreateHierarchyDialogComponent);
    }

    deleteHierarchyDialog() {
        this.dialog.open(DeleteHierarchyDialogComponent, {
            data: {
                id: this.selectedHierarchy?.id,
                name: this.selectedHierarchy?.name
            } as DeleteHierarchyData
        });
    }

    importExportHierarchyDialog() {
        this.dialog.open(ImportExportHierarchyDialogComponent, {
            data: this.selectedHierarchy
        });
    }

    createTree() {
        const component = this.treeContainer?.createComponent(HierarchyTreeComponent);
        if (!component) {
            return;
        }
        component.instance.hierarchy = this.selectedHierarchy;
        this.tree = component ?? null;
    }

    removeTree() {
        if (this.tree) {
            this.treeContainer?.clear();
            this.tree.destroy();
            this.tree = null;
            this.selectedHierarchy = null;
        }
    }
}

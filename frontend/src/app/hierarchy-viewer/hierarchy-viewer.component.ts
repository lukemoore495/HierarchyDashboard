import { HierarchyRequest } from './../hierarchy.service';
import { Component, OnDestroy, Renderer2, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Hierarchy, HierarchyListItem } from '../Hierarchy';
import { getHierarchies, getSelectedHierarchy } from '../state';
import { createHierarchy, deleteHierarchy, setSelectedHierarchy } from '../state/hierarchy.actions';
import { HierarchyState } from '../state/hierarchy.reducer';
import RRRHierarchy from '../../assets/staticFiles/RRRHierarchyPost.json';
import { MatSelectChange } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
        const dialogRef = this.dialog.open(CreateHierarchyDialog, {
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

        const dialogRef = this.dialog.open(DeleteHierarchyDialog, {
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
        const dialogRef = this.dialog.open(ImportExportHierarchyDialog, {
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

@Component({
    selector: 'create-hierarchy-dialog',
    templateUrl: 'createHierarchy.dialog.html',
    styleUrls: ['./hierarchy-viewer.component.scss']
})
export class CreateHierarchyDialog {
    constructor(
        public dialogRef: MatDialogRef<CreateHierarchyDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    doAction() {
        this.dialogRef.close({ event: 'Create', name: this.data.name, description: this.data.description });
    }

    closeDialog() {
        this.dialogRef.close({ event: 'Cancel' });
    }
}

@Component({
    selector: 'delete-hierarchy-dialog',
    templateUrl: 'deleteHierarchy.dialog.html',
    styleUrls: ['./hierarchy-viewer.component.scss']
})
export class DeleteHierarchyDialog {

    constructor(
        public dialogRef: MatDialogRef<DeleteHierarchyDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    doAction() {
        this.dialogRef.close({ event: 'Delete' });
    }

    closeDialog() {
        this.dialogRef.close({ event: 'Cancel' });
    }
}

@Component({
    selector: 'import-export-hierarchy-dialog',
    templateUrl: 'importExportHierarchy.dialog.html',
    styleUrls: ['./hierarchy-viewer.component.scss']
})
export class ImportExportHierarchyDialog {
    tabs: string[] = ['Import', 'Export'];
    selectedTabIndex = 0;
    downloadJsonHref: SafeUrl | null = null;
    downloadJsonName: string | null = null;
    file: File | null = null;
    fileName = '';

    myTabSelectedIndexChange(index: number) {
        this.selectedTabIndex = index;

        // Current tab is export, downloadJsonHref has not been set and a hierarchy has been passed in
        if (index == 1 && this.downloadJsonHref == null && this.data.hierarchy != null) {
            this.generateDownloadJsonUri();
        }
    }

    constructor(private sanitizer: DomSanitizer,
        public dialogRef: MatDialogRef<ImportExportHierarchyDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    onFileSelected(event: any) {
        this.file = event.target.files[0];
        this.fileName = this.file ? this.file.name : '';
    }

    generateDownloadJsonUri() {
        const theJSON = JSON.stringify(this.data.hierarchy);
        this.downloadJsonHref = this.sanitizer.bypassSecurityTrustUrl('data:text/json;charset=UTF-8,' + encodeURIComponent(theJSON));
        this.downloadJsonName = this.data.hierarchy.name + this.getDateTime() + '.json';
    }

    doAction() {
        if (this.selectedTabIndex == 0) {
            this.dialogRef.close({ event: 'Import', file: this.file });
        }
        else {
            this.dialogRef.close({ event: 'Export' });
        }
    }

    closeDialog() {
        this.dialogRef.close({ event: 'Cancel' });
    }

    getDateTime(): string {
        const d = new Date();
        const mo = d.getMonth() + 1;
        const yr = d.getFullYear();
        const dt = d.getDate();
        const h = d.getHours();
        const m = d.getMinutes();
        const s = d.getSeconds();

        return ('_' + mo + '-' + dt + '-' + yr + '-' + h + '-' + m + '-' + s);
    }
}

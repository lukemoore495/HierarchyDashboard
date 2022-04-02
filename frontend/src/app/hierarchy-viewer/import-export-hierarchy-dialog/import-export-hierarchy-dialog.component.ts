import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Hierarchy } from 'src/app/Hierarchy';
import { HierarchyRequest, HierarchyService } from 'src/app/hierarchy.service';
import { createHierarchy, createHierarchySuccess } from 'src/app/state/hierarchy.actions';
import { HierarchyState } from 'src/app/state/hierarchy.reducer';

@Component({
    selector: 'app-import-export-hierarchy-dialog',
    templateUrl: './import-export-hierarchy-dialog.component.html',
    styleUrls: ['./import-export-hierarchy-dialog.component.scss']
})
export class ImportExportHierarchyDialogComponent implements OnDestroy {

    tabs: string[] = ['Import', 'Export'];
    selectedTabIndex = 0;
    downloadJsonHref: SafeUrl | null = null;
    downloadJsonName: string | null = null;
    file: File | null = null;
    fileName = '';
    exportableHierarchy?: HierarchyRequest;
    subscriptions: Subscription[] = [];

    constructor(private sanitizer: DomSanitizer,
        public dialogRef: MatDialogRef<ImportExportHierarchyDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public hierarchy: Hierarchy,
        private store: Store<HierarchyState>,
        private actions$: Actions,
        private hierarchyService: HierarchyService) {

        const sub = this.hierarchyService.exportHierarchy(hierarchy.id)
            .subscribe(hierarchy => this.exportableHierarchy = hierarchy);
        this.subscriptions.push(sub);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    myTabSelectedIndexChange(index: number) {
        this.selectedTabIndex = index;

        // Current tab is export, downloadJsonHref has not been set and a hierarchy has been passed in
        if (index == 1 && this.downloadJsonHref == null && this.hierarchy != null) {
            this.generateDownloadJsonUri();
        }
    }

    onFileSelected(event: Event) {
        const element = event.currentTarget as HTMLInputElement;
        if(element.files && element.files.length > 0){
            this.file = element.files[0];
            this.fileName = this.file ? this.file.name : '';
        }
    }

    generateDownloadJsonUri() {
        if(!this.exportableHierarchy){
            return;
        }
        const theJSON = JSON.stringify(this.exportableHierarchy);
        this.downloadJsonHref = this.sanitizer.bypassSecurityTrustUrl('data:text/json;charset=UTF-8,' + encodeURIComponent(theJSON));
        this.downloadJsonName = this.hierarchy.name + this.getDateTime() + '.json';
    }

    closeDialog() {
        this.dialogRef.close();
    }

    doAction() {
        if (this.selectedTabIndex == 0 && this.file) {
            this.importFile(this.file);
        } else {
            this.closeDialog();
        }
    }

    importFile(file: File){
        const importFile: File = file;
        const fileReader = new FileReader();
        fileReader.readAsText(importFile, 'UTF-8');
        fileReader.onload = () => {
            const hierarchyRequest: HierarchyRequest = JSON.parse(fileReader.result as string);
            this.store.dispatch(createHierarchy({ hierarchy: hierarchyRequest }));
        };
        fileReader.onerror = (error) => {
            //provide better errors in the future
            console.log(error);
        };

        this.actions$
            .pipe(
                ofType(createHierarchySuccess)
            ).subscribe(_ => this.closeDialog());
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

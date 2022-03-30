import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-import-export-hierarchy-dialog',
    templateUrl: './import-export-hierarchy-dialog.component.html',
    styleUrls: ['./import-export-hierarchy-dialog.component.scss']
})
export class ImportExportHierarchyDialogComponent {

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
        public dialogRef: MatDialogRef<ImportExportHierarchyDialogComponent>,
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

import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Node } from '../../Hierarchy';
import { DirectAssessmentRequest } from '../../hierarchy.service';
import { directAssessment } from '../../state/hierarchy.actions';
import { HierarchyState } from '../../state/hierarchy.reducer';

@Component({
    selector: 'app-direct-assessment',
    templateUrl: './direct-assessment.component.html',
    styleUrls: ['./direct-assessment.component.scss']
})
export class DirectAssessmentComponent implements OnInit {
    @Input() node$?: Observable<Node | null>;
    @Input() hierarchyId: string | null = null;
    node: Node | null = null;
    children: Node[] = [];
    form: FormGroup;
    displayedColumns: string[] = ['name', 'weight'];

    constructor(private fb: FormBuilder, private store: Store<HierarchyState>) {
        this.form = fb.group({});
    }

    ngOnInit(): void {
        if(!this.node$){
            return;
        }

        this.node$
            .subscribe(node => {
                this.node = node;
                this.children = node?.children ?? [];
                for (const child of this.children) {
                    this.form.addControl(child.id, new FormControl(null, Validators.required));
                }
            });
    }

    getFormControl(name: string): AbstractControl | null {
        return this.form?.get(name);
    }

    onSubmit(){
        if(!this.hierarchyId || this.form.invalid || !this.node?.id){
            return;
        }
        const directAssessmentRequest: DirectAssessmentRequest[] = [];
        const fields = Object.entries(this.form.value);
        fields.forEach(field => directAssessmentRequest.push({
            nodeId: field[0], weight: Number(field[1])
        }));
        this.store.dispatch(directAssessment({hierarchyId: this.hierarchyId, parentId: this.node?.id, directAssessment: directAssessmentRequest}));
    }
}

import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { Node } from '../../Hierarchy';

@Component({
    selector: 'app-direct-assessment',
    templateUrl: './direct-assessment.component.html',
    styleUrls: ['./direct-assessment.component.scss']
})
export class DirectAssessmentComponent implements OnInit {
    @Input() node$?: Observable<Node | null>;
    node: Node | null = null;
    children: Node[] = [];
    form: FormGroup;
    displayedColumns: string[] = ['name', 'weight'];

    constructor(private fb: FormBuilder) {
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
            });

        for (const child of this.children) {
            this.form.addControl(child.id.toString(), new FormControl(0, Validators.required));
        }
    }

    getFormControl(name: string): AbstractControl | null {
        return this.form?.get(name);
    }
}

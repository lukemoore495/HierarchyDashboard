import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-direct-assessment',
    templateUrl: './direct-assessment.component.html',
    styleUrls: ['./direct-assessment.component.scss']
})
export class DirectAssessmentComponent implements OnInit {
    form: FormGroup;

    constructor(private fb: FormBuilder) {
        this.form = fb.group({});
    }

    ngOnInit(): void {
        for (const weight of this.weights) {
            this.form.addControl(weight.id.toString(), new FormControl(0, Validators.required));
        }
    }

    weights: Array<{ id: number, name: string, value: number }> = [
        { id: 0, name: 'Security', value: 0 },
        { id: 1, name: 'Justice', value: 0 },
        { id: 2, name: 'Economic Opportunities', value: 0 },
        { id: 3, name: 'Education', value: 0 },
        { id: 4, name: 'Socio Economic', value: 0 },
    ];

    getFormControl(name: string): AbstractControl | null {
        return this.form?.get(name);
    }
}

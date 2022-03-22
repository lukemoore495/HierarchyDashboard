import { Component, OnInit } from '@angular/core';
import { Options, LabelType } from '@angular-slider/ngx-slider';
import { AbstractControl, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-pairwise-comparison',
    templateUrl: './pairwise-comparison.component.html',
    styleUrls: ['./pairwise-comparison.component.scss']
})
export class PairwiseComparisonComponent implements OnInit {

    form: FormGroup;

    constructor(private fb: FormBuilder) {
        this.form = fb.group({});
    }

    ngOnInit(): void {
        this.weights.forEach((weight, index) => {
            [...Array(this.weights.length).keys()].forEach(i => {
                if (index < i) {
                    this.form.addControl(weight.id.toString() + this.weights[i].id.toString(), new FormControl(1, Validators.required));
                }
            })
        })
    };

    weights: Array<{ id: number, name: string, value: number }> = [
        { id: 0, name: 'Security', value: 0 },
        { id: 1, name: 'Justice', value: 0 },
        { id: 2, name: 'Economic Opportunities', value: 0 },
        { id: 3, name: 'Education', value: 0 },
        { id: 4, name: 'Socio Economic', value: 0 },
    ];

    header: Array<string> = [
        'Measure Name',
        'Local Weight',
        'Consistency Ratio'
    ];

    sliderControl: FormControl = new FormControl();

    options: Options = {
        showTicksValues: true,
        showSelectionBarFromValue: 9,
        stepsArray: [
            { value: -10 },
            { value: -9, legend: 'Extremely Favor' },
            { value: -8 },
            { value: -7, legend: 'Very Strongly Favor' },
            { value: -6 },
            { value: -5, legend: 'Strongly Favor' },
            { value: -4 },
            { value: -3, legend: 'Slightly Favor' },
            { value: -2 },
            { value: 1, legend: 'Equal' },
            { value: 2 },
            { value: 3, legend: 'Slightly Favor' },
            { value: 4 },
            { value: 5, legend: 'Strongly Favor' },
            { value: 6 },
            { value: 7, legend: 'Very Strongly Favor' },
            { value: 8 },
            { value: 9, legend: 'Extremely Favor' },
            { value: 10 },
        ],
        translate: (value: number, label: LabelType): string => {
            // hide even values
            if (value % 2 == 0) {
                return '';
            }

            // Show only the absolute value
            return Math.abs(value).toString();
        }
    };
}

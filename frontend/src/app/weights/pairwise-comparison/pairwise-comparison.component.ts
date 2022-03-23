import { Component, OnInit } from '@angular/core';
import { Options, LabelType } from '@angular-slider/ngx-slider';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Input } from '@angular/core';
import { Node } from '../../Hierarchy';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-pairwise-comparison',
    templateUrl: './pairwise-comparison.component.html',
    styleUrls: ['./pairwise-comparison.component.scss']
})
export class PairwiseComparisonComponent implements OnInit {
    @Input() node$?: Observable<Node | null>;
    node: Node | null = null;
    children: Node[] = [];
    displayedColumns: string[] = ['name', 'weight'];
    form: FormGroup;

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

        this.children = this.node?.children ?? [];
        this.children.forEach((weight, index) => {
            [...Array(this.children.length).keys()].forEach(i => {
                if (index < i) {
                    this.form.addControl(weight.id.toString() + this.children[i].id.toString(), new FormControl(1, Validators.required));
                }
            });
        });
    };

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

import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { MatSliderChange } from '@angular/material/slider';
import { HierarchyService } from '../hierarchy.service';
import { SensitivityAnalysis, SensitivityAnalysisReport } from './SensitivityAnalysis';
import { Store } from '@ngrx/store';
import { HierarchyState } from '../state/hierarchy.reducer';
import { getSelectedHierarchy } from '../state';
import { map } from 'rxjs';

@Component({
    selector: 'app-sensitivity-analysis',
    templateUrl: './sensitivity-analysis.component.html',
    styleUrls: ['./sensitivity-analysis.component.scss']
})
export class SensitivityAnalysisComponent implements OnInit {
    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
    @Input() height: string | undefined;
    @Input() width: string | undefined;
    sliderValue: number | null = 0.2;
    sensitivityAnalysisReport: SensitivityAnalysisReport | null = null;
    nodeNames: string[] = [];

    constructor(private hierarchyService: HierarchyService, private store: Store<HierarchyState>) {
        store.select(getSelectedHierarchy)
            .pipe(
                map(hierarchy => hierarchy?.nodes.map(node => node.name)),
            )
            .subscribe(names => this.nodeNames = names ?? []);
    }

    ngOnInit(): void {
        Chart.register(annotationPlugin);
        //this.hierarchyService.getSensitivityAnalysis('someId')
        this.hierarchyService.getFakeSensitivityAnalysis(this.nodeNames)
            .subscribe(analysis => {
                this.sensitivityAnalysisReport = analysis;
                const sensitiviyAnalysis = analysis.report.find(x => x.globalValue === this.sliderValue);
                if (sensitiviyAnalysis) {
                    this.setChartValues(sensitiviyAnalysis);
                }
            });
    }

    onSliderChange(event: MatSliderChange) {
        this.sliderValue = event.value;
        if (!this.sensitivityAnalysisReport)
            return;

        const sensitiviyAnalysis = this.sensitivityAnalysisReport.report.find(x => x.globalValue === this.sliderValue);
        if (sensitiviyAnalysis) {
            this.setChartValues(sensitiviyAnalysis);
        }
    }

    onSliderMove(event: MatSliderChange) {
        this.sliderValue = event.value;
        if (event.value !== null) {
            this.setVerticalLine(event.value);
        }
    }

    setChartValues(sensitivityAnalysis: SensitivityAnalysis): void {
        this.lineChartData.datasets = [];
        for (let i = 0; i < this.nodeNames.length; i++) {
            const label = sensitivityAnalysis.data[i].name;
            const data = sensitivityAnalysis.data[i].data;

            this.lineChartData.datasets.push(
                {
                    data: data,
                    label: label,
                    backgroundColor: 'rgba(148,159,177,0.2)',
                    fill: false,
                }
            );
        }

        this.setVerticalLine(sensitivityAnalysis.globalValue);
        this.chart?.update();
    }

    setVerticalLine(xValue: number) {
        this.lineChartOptions = this.getChartOptions(xValue.toString());
    }

    getChartOptions(verticalLineValue: string | undefined): ChartConfiguration['options'] {
        return {
            elements: {
                line: {
                    tension: 0.5
                }
            },
            scales: {
                x: {},
                'y-axis-0':
                {
                    position: 'left',
                },
                'y-axis-1': {
                    position: 'right',
                    grid: {
                        color: 'rgba(255,0,0,0.3)',
                    },
                    ticks: {
                        color: 'red'
                    }
                }
            },

            plugins: {
                legend: { display: true },
                annotation: {
                    annotations: [
                        {
                            type: 'line',
                            scaleID: 'x',
                            value: verticalLineValue,
                            borderColor: 'black',
                            borderWidth: 2,
                        }
                    ]
                }
            }
        };
    }
    public lineChartData: ChartConfiguration['data'] = {
        datasets: [
            {
                data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                label: 'Security',
                backgroundColor: 'rgba(148,159,177,0.2)',
                fill: false,
            },
            {
                data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                label: 'Justice',
                backgroundColor: 'rgba(148,159,177,0.2)',
                fill: false,
            },
            {
                data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                label: 'Economic Opportunities',
                backgroundColor: 'rgba(148,159,177,0.2)',
                fill: false,
            },
            {
                data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                label: 'Education',
                backgroundColor: 'rgba(148,159,177,0.2)',
                fill: false,
            },
            {
                data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                label: 'Socio Economic',
                backgroundColor: 'rgba(148,159,177,0.2)',
                fill: false,
            }
        ],
        labels: ['0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1']
    };

    public lineChartOptions: ChartConfiguration['options'] = this.getChartOptions(this.sliderValue?.toString());

    lineChartType: ChartType = 'line';
}

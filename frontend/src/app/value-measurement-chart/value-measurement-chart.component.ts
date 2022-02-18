import { Component, Input, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ChartConfiguration, ChartType } from 'chart.js';
import { getSelectedMeasurement, getSelectedMeasurementDefinition } from '../state';
import { HierarchyState } from '../state/hierarchy.reducer';
import { BaseChartDirective } from 'ng2-charts';
import { AfterViewInit } from '@angular/core';
import { Measurement } from '../Hierarchy';
import { combineLatest } from 'rxjs';

@Component({
    selector: 'app-value-measurement-chart',
    templateUrl: './value-measurement-chart.component.html',
    styleUrls: ['./value-measurement-chart.component.scss']
})
export class ValueMeasurementChartComponent implements AfterViewInit {
    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
    @Input() height: string | undefined;
    @Input() width: string | undefined;
    backgroundColors: string[] = [];
    hoverBorderColors: string[] = [];
    primaryColorString = 'rgb(103, 58, 183)'
    accentColorString = 'rgb(255, 160, 0)'
    hoverColorString = 'rgb(245, 245, 245)'

    constructor(private store: Store<HierarchyState>) { }

    ngAfterViewInit() {
        let selectedMeasurement$ = this.store.select(getSelectedMeasurement);
        let selectedMeasurementDefinition$ = this.store.select(getSelectedMeasurementDefinition);
        combineLatest([
            selectedMeasurement$,
            selectedMeasurementDefinition$
        ])
        .subscribe(measurement => {
            if(!this.chart) {
                return;
            }

            if(!measurement[0]){
                this.updateChartData([], []);
                this.updateLabel('');
                this.chart.update();
                return;
            }

            this.chartNewMeasurement(measurement[0]);
            if(measurement[1]?.measurementName){
                this.updateLabel(measurement[1].measurementName);
            }
            this.chart.update();
        })
    }

    chartNewMeasurement(measurement : Measurement) {

        let insertValuePoint = (measure: number, value: number) : number => {
            xAxis.push(measure.toString());
            xAxis = xAxis.sort((first, second) => Number(first) - Number(second));
    
            let pointIndex = xAxis.indexOf(measure.toString());
            yAxis = this.insert(yAxis, pointIndex, value);
            return pointIndex;
        }

        if(!this.chart || !measurement.valueFunctionData || !measurement.measure || !measurement.value){
            return;
        }

        let xAxis : string[] = [];
        let yAxis : number[] = [];

        for(let point of measurement.valueFunctionData){
            xAxis.push(point.x.toString());
            yAxis.push(point.y);
        }

        let pointIndex = insertValuePoint(measurement.measure, measurement.value);

        this.updateChartData(xAxis, yAxis);
        this.setPointColors(xAxis.length, pointIndex);
    }

    updateChartData(xAxis: string[], yAxis: number[]){
        this.lineChartData.labels = xAxis;
        this.lineChartData.datasets[0].data = yAxis;
    }

    setPointColors(chartLength: number, valuePointIndex: number){
        for(let i = 0; i < chartLength; i++){
            if(i === valuePointIndex){
                this.backgroundColors.push(this.accentColorString);
                this.hoverBorderColors.push(this.primaryColorString);
                continue;
            }
            this.backgroundColors.push(this.primaryColorString)
            this.hoverBorderColors.push(this.accentColorString);
        }
    }

    updateLabel(label: string) {
        this.lineChartData.datasets[0].label = label;
    }

    insert(arr : any[], insertAt: number, value : any) : any[]{
        arr.splice(insertAt, 0, value);
        return arr;
    }

    public lineChartData : ChartConfiguration['data'] = {
        datasets: [
            {
                data: [],
                label: '',
                backgroundColor: 'rgba(148,159,177,0.2)',
                borderColor: this.primaryColorString,
                pointBackgroundColor: this.backgroundColors,
                pointBorderColor: this.backgroundColors,
                pointHoverBackgroundColor: this.hoverColorString,
                pointHoverBorderColor: this.hoverBorderColors,
                fill: 'origin',
            }
        ],
        labels: []
    };

    public lineChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
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
            legend: { display: true }
        }
    };

    lineChartType: ChartType = 'line';
}

import { Component, Input, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ChartConfiguration, ChartType } from 'chart.js';
import { getSelectedMeasurement, getSelectedMeasurementNode } from '../../state';
import { HierarchyState } from '../../state/hierarchy.reducer';
import { BaseChartDirective } from 'ng2-charts';
import { AfterViewInit } from '@angular/core';
import { MeasurementType, Point, Value } from '../../Hierarchy';
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
    primaryColorString = 'rgb(103, 58, 183)';
    accentColorString = 'rgb(255, 160, 0)';
    hoverColorString = 'rgb(245, 245, 245)';

    constructor(private store: Store<HierarchyState>) { }

    ngAfterViewInit() {
        const selectedMeasurement$ = this.store.select(getSelectedMeasurement);
        const selectedMeasurementNode$ = this.store.select(getSelectedMeasurementNode);
        combineLatest([
            selectedMeasurement$,
            selectedMeasurementNode$
        ])
            .subscribe(value => {
                if(!this.chart) {
                    return;
                }

                if(!value[0]){
                    this.clearChartData();
                    this.updateLabel('');
                    this.chart.update();
                    return;
                }

                if(value[1]?.measurementDefinition?.valueFunctionData 
                    && !(value[1].measurementDefinition.measurementType === MeasurementType.Boolean)){
                    this.chartNewValue(value[0], value[1]?.measurementDefinition?.valueFunctionData);
                } 

                //If Boolean measurementType we will just plot the referencePoints. This should be
                //modeled as a categorical value function later on.
                if(value[1]?.measurementDefinition?.measurementType === MeasurementType.Boolean
                    && (value[1]?.measurementDefinition?.valueFunctionData 
                        || value[1]?.measurementDefinition?.referencePoints)){
                    const points = value[1].measurementDefinition.referencePoints 
                    ?? value[1].measurementDefinition.valueFunctionData 
                    ?? [];
                    this.chartNewValue(value[0], points);
                }

                if(!value[1]?.measurementDefinition?.valueFunctionData){
                    this.clearChartData();
                }

                if(value[1]?.name){
                    this.updateLabel(value[1].name);
                }
                this.chart.update();
            });
    }

    chartNewValue(value : Value, points: Point[]) {

        const insertValuePoint = (measure: number, value: number) : number => {
            const existingPoint = xAxis.some(x => x === measure.toString());
            if(!existingPoint){
                xAxis.push(measure.toString());
            }
            xAxis = xAxis.sort((first, second) => Number(first) - Number(second));
            const pointIndex = xAxis.indexOf(measure.toString());
            if(!existingPoint){
                yAxis = this.insert(yAxis, pointIndex, value);
            }
            return pointIndex;
        };

        if(!this.chart){
            return;
        }

        let xAxis : string[] = [];
        let yAxis : number[] = [];

        for(const point of points){
            xAxis.push(point.x.toString());
            yAxis.push(point.y);
        }

        let pointIndex: number | null = null;
        if(value.measure !== null 
            && value.localValue !== null 
            && value.localValue !== undefined){
            pointIndex = insertValuePoint(value.measure, value.localValue);
        }

        this.setPointColors(xAxis.length, pointIndex);

        this.lineChartData = {
            datasets: [
                {
                    data: yAxis,
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
            labels: xAxis
        };
    }

    clearChartData(){
        this.lineChartData.labels = [];
        this.lineChartData.datasets[0].data = [];
    }

    setPointColors(chartLength: number, valuePointIndex: number | null){
        this.backgroundColors = [];
        this.hoverBorderColors = [];
        for(let i = 0; i < chartLength; i++){
            if(i === valuePointIndex){
                this.backgroundColors.push(this.accentColorString);
                this.hoverBorderColors.push(this.primaryColorString);
                continue;
            }
            this.backgroundColors.push(this.primaryColorString);
            this.hoverBorderColors.push(this.accentColorString);
        }
    }

    updateLabel(label: string) {
        this.lineChartData.datasets[0].label = label;
    }

    insert(arr : number[], insertAt: number, value : number) : number[]{
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

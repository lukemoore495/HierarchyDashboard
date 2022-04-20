import { AfterViewInit, OnDestroy } from '@angular/core';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Subscription } from 'rxjs/internal/Subscription';
import { map, tap } from 'rxjs/operators';
import { Alternative, Hierarchy, Node } from '../Hierarchy';
import { getSelectedHierarchy } from '../state';
import { HierarchyState } from '../state/hierarchy.reducer';
import { Rank, RankChartData, RankValue } from './Rank';

@Component({
    selector: 'app-rank-chart',
    templateUrl: './rank-chart.component.html',
    styleUrls: ['./rank-chart.component.scss']
})
export class RankChartComponent implements AfterViewInit, OnDestroy {
    @ViewChild('rankChart') canvas?: ElementRef<HTMLDivElement>;
    @ViewChild('primary') primary?: ElementRef;
    @ViewChild('accent') accent?: ElementRef;
    @ViewChild('hover') hover?: ElementRef;
    @ViewChild('rankChart') rankChart?: ElementRef;
    @Input() height?: string;
    @Input() width?: string;
    colors: string[] = [];
    barChartType: ChartType = 'bar';
    primaryColorString = 'rgb(103, 58, 183)';
    accentColorString = 'rgb(255, 160, 0)';
    mutedColorString = 'rgb(255, 236, 179)';
    hoverColorString = 'rgb(189, 189, 189)';
    measurementNodes: Node[] = [];
    subscriptions: Subscription[] = [];
    hasData = false;

    constructor(private store: Store<HierarchyState>) {
        const selectedHierarchy$ = this.store.select(getSelectedHierarchy);

        const sub = selectedHierarchy$
            .pipe(
                tap(hierarchy => {
                    if(hierarchy) {
                        this.measurementNodes = this.getAllMeasurementNodes(hierarchy);
                    }
                    if(hierarchy && hierarchy?.alternatives?.length > 0){
                        this.hasData = true;
                        return;
                    }
                    this.hasData = false;
                }),
                map(hierarchy => hierarchy?.alternatives),
                map(alternatives => alternatives ? this.rankAlternatives(alternatives): []),
            ).subscribe(ranks => {
                this.updateRanking(ranks);
            });             
        this.subscriptions.push(sub); 
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    ngAfterViewInit() {
        // const primaryColorString = getComputedStyle(this.primary?.nativeElement).color;
        // const accentColorString = getComputedStyle(this.accent?.nativeElement).color;
        // const hoverColorString = getComputedStyle(this.hover?.nativeElement).color;
        // const mutedColorString = getComputedStyle(this.accent?.nativeElement).color;
    }

    getAllMeasurementNodes(hierarchy: Hierarchy): Node[] {
        const getMeasurementNodes = (node: Node): Node[] => {
            const currentMeasurementNodes: Node[] = [];
            const measurementNodes = node.children.filter(node => node.measurementDefinition);
            const nodes = node.children.filter(node => !node.measurementDefinition);
            currentMeasurementNodes.push(...measurementNodes);
            nodes.forEach(node => currentMeasurementNodes.push(...getMeasurementNodes(node)));
            return currentMeasurementNodes;
        };

        const AllMeasurementNodes: Node[] = [];
        hierarchy.root.children.forEach(node => AllMeasurementNodes.push(...getMeasurementNodes(node)));
        return AllMeasurementNodes;
    }

    findMeasurementName(measurementId: string): string | null {
        const measurement = this.measurementNodes.find(measurement => measurement.id === measurementId);
        return measurement?.name ?? null;
    }

    rankAlternatives(alternatives: Alternative[]): Rank[] {
        const findRankValue = (alternative: Alternative): RankValue[] => {
            const values: RankValue[] = [];
            alternative.values.forEach(measurement => {
                values.push({
                    value: measurement.globalValue ?? 0,
                    name: this.findMeasurementName(measurement.nodeId)
                });
            });
            return values;
        };

        const ranks: Rank[] = [];
        alternatives.forEach(alternative => {
            const rankValues = findRankValue(alternative);
            const total = rankValues
                .map(r => r.value)
                .reduce((sum, next) => sum + next);

            ranks.push({
                alternativeName: alternative.name,
                values: rankValues,
                total: total
            });
        });

        ranks.sort((a, b) => b.total - a.total);
        return ranks;
    }

    updateRanking(ranks: Rank[]) {
        const rankValuesToBarChartData = (rankValues: RankValue[][]): RankChartData[] => {
            if(rankValues.length === 0){
                return [];
            }
            
            const barChartData: RankChartData[] = [];
            for(let i = 0; i < rankValues[0].length; i++) {
                const dataColumn: number[] = [];
                let label: string | null = null;
                for(const data of rankValues) {
                    if(!label) {
                        label = data[i].name;
                    }
                    dataColumn.push(data[i].value);
                }
                barChartData.push({
                    label: label,
                    values: dataColumn
                });
            }
            return barChartData;
        };

        const data: RankValue[][] = [];
        const labels: string[] = [];
        for(const rank of ranks) {
            labels.push(rank.alternativeName);
            data.push(rank.values);
        }
        this.updateChart(rankValuesToBarChartData(data), labels);
    }

    updateChart(data: RankChartData[], labels: string[]) {
        const colors = this.createColorFade(this.primaryColorString, this.accentColorString, this.mutedColorString, data.length);
        const datasets = [];
        for(let i = 0; i < data.length; i++) {
            const dataset = data[i];
            datasets.push({
                data: dataset.values,
                label: dataset.label ?? '',
                stack: 'next',
                backgroundColor: colors[i],
                hoverBackgroundColor: this.hoverColorString
            });
        }

        this.barChartData = {
            labels: labels,
            datasets: datasets
        };
    }

    createColorFade(primaryColor: string, accentColor: string, mutedColor: string, total: number): string[] {
        const createColorArrayByCase = (num: number, total: number): string[] => {
            if(num === 0) {
                return this.createColorArray(primaryColor, mutedColor, total);
            }
            if(num === 1){
                return this.createColorArray(mutedColor, accentColor, total);
            }
            if(num === 2){
                return this.createColorArray(accentColor, primaryColor, total);
            }
            return [];
        };

        const fadeLength = 7;
        const totalFades = Math.floor(total/fadeLength);
        const remainder = totalFades % fadeLength;
        if(total < 7 || totalFades === 1) {
            return this.createColorArray(primaryColor, accentColor, total);
        }

        const colors: string[] = [];
        for(let i = 0; i <= totalFades; i++) {
            const current = i%3;
            if(i === totalFades){
                colors.push(...createColorArrayByCase(current, remainder));
                continue;
            }
            colors.push(...createColorArrayByCase(current, fadeLength));
        }
        return colors;
    }

    createColorArray(rgbColorStart: string, rgbColorEnd: string, total: number): string[] {
        const colorStart: number[] = rgbColorStart.replace(/[^\d,]/g, '').split(',').map(x => +x);
        const colorEnd: number[] = rgbColorEnd.replace(/[^\d,]/g, '').split(',').map(x => +x);
        const colors: string[] = [];
        for(let i = 0; i < total; i++){
            const fade = i/total;
            let diffRed = colorEnd[0] - colorStart[0];
            let diffGreen = colorEnd[1] - colorStart[1];
            let diffBlue = colorEnd[2] - colorStart[2];

            diffRed = (diffRed * fade) + colorStart[0];
            diffGreen = (diffGreen * fade) + colorStart[1];
            diffBlue = (diffBlue * fade) + colorStart[2];

            colors.push(`rgb(${diffRed}, ${diffGreen}, ${diffBlue})`);
        }
        return colors;
    }

    public barChartData : ChartData<'bar'> = {
        labels: [],
        datasets: []
    };

    barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {   
                display: false
            },
            y: {}
        },
        plugins: {
            legend: {
                display: true,
                position: 'bottom'
            }
        },
        indexAxis: 'y',
    };
}

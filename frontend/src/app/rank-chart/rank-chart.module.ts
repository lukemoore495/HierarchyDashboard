import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RankChartComponent } from './rank-chart.component';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
    declarations: [
        RankChartComponent
    ],
    imports: [
        NgChartsModule,
        CommonModule
    ],
    exports: [
        RankChartComponent
    ]
})
export class RankChartModule { }

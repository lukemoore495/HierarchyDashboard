import { NgModule } from "@angular/core";
import { RankChartComponent } from "./rank-chart.component";
import { NgChartsModule } from 'ng2-charts';

@NgModule({
    declarations: [
        RankChartComponent
    ],
    imports: [
        NgChartsModule
    ],
    exports: [
        RankChartComponent
    ]
  })
export class RankChartModule { }

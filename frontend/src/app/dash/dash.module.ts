import { NgModule } from "@angular/core";
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { AlternativesFormModule} from "../alternatives-form/alternatives-form.module";
import { RankChartModule } from "../rank-chart/rank-chart.module";
import { ValueMeasurementChartModule } from "../value-measurement-chart/value-measurement-chart.module";
import { DashComponent } from "./dash.component";
import { CommonModule } from '@angular/common';  

@NgModule({
    declarations: [
        DashComponent
    ],
    imports: [
        MatCardModule,
        MatGridListModule,
        RankChartModule,
        ValueMeasurementChartModule,
        MeasurementsFormModule,
        CommonModule,
        MatSelectionModule,
        MatFormFieldModule,
        AlternativesFormModule,
        CommonModule
    ],
    exports: [
        DashComponent
    ]
  })
export class DashModule { }

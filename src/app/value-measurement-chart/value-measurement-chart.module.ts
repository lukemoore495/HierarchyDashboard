import { NgModule } from "@angular/core";
import { NgChartsModule } from 'ng2-charts';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ValueMeasurementChartComponent } from "./value-measurement-chart.component";

@NgModule({
    declarations: [
        ValueMeasurementChartComponent
    ],
    imports: [
        NgChartsModule,
        MatFormFieldModule,
        MatInputModule
    ],
    exports: [
        ValueMeasurementChartComponent
    ]
  })
export class ValueMeasurementChartModule { }

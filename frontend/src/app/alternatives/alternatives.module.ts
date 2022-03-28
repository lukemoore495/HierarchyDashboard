import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { AlternativesFormModule} from './alternatives-form/alternatives-form.module';
import { ValueMeasurementChartModule } from './value-measurement-chart/value-measurement-chart.module';
import { AlternativesComponent } from './alternatives.component';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
    declarations: [
        AlternativesComponent
    ],
    imports: [
        MatCardModule,
        MatGridListModule,
        ValueMeasurementChartModule,
        CommonModule,
        MatSelectModule,
        MatFormFieldModule,
        AlternativesFormModule,
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule
    ],
    exports: [
        AlternativesComponent
    ]
})
export class AlternativesModule { }

import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { AlternativesFormModule } from './alternatives-form/alternatives-form.module';
import { ValueMeasurementChartModule } from './value-measurement-chart/value-measurement-chart.module';
import { AlternativesComponent } from './alternatives.component';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { CreateAlternativeDialogComponent } from './create-alternative-dialog/create-alternative-dialog.component';
import { DeleteAlternativeDialogComponent } from './delete-alternative-dialog/delete-alternative-dialog.component';
import { FormsModule } from '@angular/forms';
@NgModule({
    declarations: [
        AlternativesComponent,
        CreateAlternativeDialogComponent,
        DeleteAlternativeDialogComponent
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
        MatMenuModule,
        MatDialogModule,
        FormsModule
    ],
    exports: [
        AlternativesComponent
    ]
})
export class AlternativesModule { }

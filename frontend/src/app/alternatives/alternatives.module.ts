import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AlternativesFormModule } from './alternatives-form/alternatives-form.module';
import { AlternativesComponent } from './alternatives.component';
import { CreateAlternativeDialogComponent } from './create-alternative-dialog/create-alternative-dialog.component';
import { DeleteAlternativeDialogComponent } from './delete-alternative-dialog/delete-alternative-dialog.component';
import { ValueMeasurementChartModule } from './value-measurement-chart/value-measurement-chart.module';
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
        MatInputModule,
        AlternativesFormModule,
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatDialogModule,
        FormsModule,
        MatProgressSpinnerModule
    ],
    exports: [
        AlternativesComponent
    ]
})
export class AlternativesModule { }

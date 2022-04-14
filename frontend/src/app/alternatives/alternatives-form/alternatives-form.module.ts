import { NgModule } from '@angular/core';
import { AlternativesFormComponent } from './alternatives-form.component';
import { MeasurementsPanelComponent } from './measurements-panel/measurements-panel.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';  
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule} from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
    declarations: [
        AlternativesFormComponent,
        MeasurementsPanelComponent
    ],
    imports: [
        MatFormFieldModule,
        MatExpansionModule,
        MatIconModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatCheckboxModule,
        MatSliderModule,
        MatCardModule,
        MatListModule,
        MatProgressSpinnerModule
    ],
    exports: [
        AlternativesFormComponent,
        MeasurementsPanelComponent
    ]
})
export class AlternativesFormModule { }

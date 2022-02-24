import { NgModule } from "@angular/core";
import { MeasurementsFormComponent } from "./measurements-form.component";
import { MeasurementsPanelComponent } from "./measurements-panel/measurements-panel.component";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';  
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule} from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card'

@NgModule({
    declarations: [
        MeasurementsFormComponent,
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
        MatCardModule
    ],
    exports: [
        MeasurementsFormComponent,
        MeasurementsPanelComponent
    ]
  })
export class MeasurementsFormModule { }

import { NgModule } from "@angular/core";
import { NgChartsModule } from 'ng2-charts';
import { MatSliderModule} from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SensitivityAnalysisComponent } from "./sensitivity-analysis.component";

@NgModule({
    declarations: [
        SensitivityAnalysisComponent
    ],
    imports: [
        NgChartsModule,
        MatSliderModule,
        MatFormFieldModule
    ],
    exports: [
        SensitivityAnalysisComponent
    ]
  })
export class SensitivityAnalysisModule { }

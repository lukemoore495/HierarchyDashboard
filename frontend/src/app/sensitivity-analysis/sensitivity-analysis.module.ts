import { NgModule } from "@angular/core";
import { NgChartsModule } from 'ng2-charts';
import { SensitivityAnalysisComponent } from "./sensitivity-analysis.component";

@NgModule({
    declarations: [
        SensitivityAnalysisComponent
    ],
    imports: [
        NgChartsModule
    ],
    exports: [
        SensitivityAnalysisComponent
    ]
  })
export class SensitivityAnalysisModule { }

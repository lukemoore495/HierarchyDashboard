import { NgModule } from "@angular/core";
import { NgChartsModule } from 'ng2-charts';
import { MatSliderModule} from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SensitivityAnalysisComponent } from "./sensitivity-analysis.component";

@NgModule({
    declarations: [
        SensitivityAnalysisComponent
    ],
    imports: [
        NgChartsModule,
        MatSliderModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule
    ],
    exports: [
        SensitivityAnalysisComponent
    ]
  })
export class SensitivityAnalysisModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { WeightsComponent } from './weights.component';
import { DirectAssessmentComponent } from './direct-assessment/direct-assessment.component';
import { PairwiseComparisonComponent } from './pairwise-comparison/pairwise-comparison.component';
import { SwingWeightComponent } from './swing-weight/swing-weight.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { MatCardModule } from '@angular/material/card';


@NgModule({
    declarations: [
        WeightsComponent,
        DirectAssessmentComponent,
        PairwiseComparisonComponent,
        SwingWeightComponent
    ],
    imports: [CommonModule, MatTabsModule, MatGridListModule, DragDropModule, MatInputModule, FormsModule, ReactiveFormsModule, NgxSliderModule, MatCardModule],
})
export class WeightsModule { }

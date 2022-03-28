import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlternativesComponent } from './alternatives/alternatives.component';
import { HierarchyViewerComponent } from './hierarchy-viewer/hierarchy-viewer.component';
import { WeightsComponent } from './weights/weights.component';
import { RankChartComponent } from './rank-chart/rank-chart.component';
import { SensitivityAnalysisComponent } from './sensitivity-analysis/sensitivity-analysis.component';

const routes: Routes = [
    { path: 'alternatives', component: AlternativesComponent },
    { path: 'rank', component: RankChartComponent },
    { path: 'weights/:id', component: WeightsComponent },
    { path: 'hierarchyViewer', component: HierarchyViewerComponent },
    { path: 'sensitivityAnalysis', component: SensitivityAnalysisComponent },
    { path: '**', redirectTo: 'hierarchyViewer' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashComponent } from './dash/dash.component';
import { HierarchicalViewComponent } from './hierarchical-view/hierarchical-view.component';
import { ImportanceValueComponent } from './importance-value/importance-value.component';
import { RankChartComponent } from './rank-chart/rank-chart.component';
import { SensitivityAnalysisComponent } from './sensitivity-analysis/sensitivity-analysis.component';

const routes: Routes = [
    { path: 'alternatives', component: DashComponent },
    { path: 'rank', component: RankChartComponent },
    { path: 'weights/:id',component: ImportanceValueComponent },
    { path: 'hierarchicalView', component: HierarchicalViewComponent },
    { path: 'sensitivityAnalysis', component: SensitivityAnalysisComponent },
    { path: '**', redirectTo: 'hierarchicalView'}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

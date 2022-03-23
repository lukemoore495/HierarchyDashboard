import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { HierarchyReducer } from './state/hierarchy.reducer';
import { EffectsModule } from '@ngrx/effects';
import { HierarchyEffects } from './state/hierarchy.effects';
import { WeightsModule } from './weights/weights.module';
import { HierarchicalViewModule } from './hierarchical-view/hierarchical-view.module';
import { DashModule } from './dash/dash.module';
import { NavModule } from './nav/nav.module';
import { SensitivityAnalysisModule } from './sensitivity-analysis/sensitivity-analysis.module';
import { RankChartModule } from './rank-chart/rank-chart.module';


@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        StoreModule.forRoot({ hierarchies: HierarchyReducer }),
        StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
        EffectsModule.forRoot([HierarchyEffects]),
        WeightsModule,
        HierarchicalViewModule,
        SensitivityAnalysisModule,
        RankChartModule,
        DashModule,
        NavModule,
        HttpClientModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }

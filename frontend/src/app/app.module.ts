import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { HierarchyReducer } from './state/hierarchy.reducer';
import { EffectsModule } from '@ngrx/effects';
import { HierarchyEffects } from './state/hierarchy.effects';
import { ImportanceValueModule } from './importance-value/importance-value.module';
import { HierarchicalViewModule } from './hierarchical-view/hierarchical-view.module';
import { DashModule } from './dash/dash.module';
import { NavModule } from './nav/nav.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    StoreModule.forRoot({hierarchies: HierarchyReducer}),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
    EffectsModule.forRoot([HierarchyEffects]),
    ImportanceValueModule,
    HierarchicalViewModule,
    DashModule,
    NavModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

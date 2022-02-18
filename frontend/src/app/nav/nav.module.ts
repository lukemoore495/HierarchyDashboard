import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';  
import { AppRoutingModule } from "../app-routing.module";
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { NavComponent } from "./nav.component";

import { NgChartsModule } from 'ng2-charts';
import { LayoutModule } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { DragDropModule} from '@angular/cdk/drag-drop';

@NgModule({
    declarations: [
        NavComponent
    ],
    imports: [
        CommonModule,
        AppRoutingModule,
        MatSidenavModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,

        NgChartsModule,
        LayoutModule,
        MatButtonModule,
        MatGridListModule,
        MatCardModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        FormsModule,
        MatExpansionModule,
        DragDropModule
    ],
    exports: [
        NavComponent
    ]
  })
export class NavModule { }

import { Injectable } from "@angular/core";
import { createEffect, Actions, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, concatMap, map, mergeMap } from "rxjs/operators";
import { HierarchyService } from "../hierarchy.service";
import * as HierarchyActions from "./hierarchy.actions";

@Injectable()
export class HierarchyEffects {
    constructor(private actions$: Actions, private hierarchyService: HierarchyService) { }

    createHierarchy$ = createEffect(() => {
        return this.actions$
            .pipe(
                ofType(HierarchyActions.createHierarchy),
                concatMap(action => this.hierarchyService.createHierarchy(action.hierarchy)
                    .pipe(
                        map(hierarchy => HierarchyActions.createHierarchySuccess({ hierarchy: hierarchy })),
                        catchError(error => of(HierarchyActions.createHierarchyFailure({ error })))
                    )
                )
            )
    });
    retrieveHierarchies$ = createEffect(() => {
        return this.actions$
            .pipe(
                ofType(HierarchyActions.retrieveHierarchies),
                mergeMap(() => this.hierarchyService.getHierarchies()
                    .pipe(
                        map(hierarchies => HierarchyActions.retrieveHierarchiesSuccess({ hierarchies })),
                        catchError(error => of(HierarchyActions.retrieveHierarchiesFailure({ error })))
                    )
                )
            )
    });
    setHierarchy$ = createEffect(() => {
        return this.actions$
            .pipe(
                ofType(HierarchyActions.setSelectedHierarchy),
                mergeMap(action => this.hierarchyService.getHierarchy(action.selectedHierarchyId)
                    .pipe(
                        map(hierarchy => HierarchyActions.setSelectedHierarchySuccess({ hierarchy })),
                        catchError(error => of(HierarchyActions.setSelectedHierarchyFailure({ error })))
                    )
                )
            )
    });

    deleteHierarchy$ = createEffect(() => {
        return this.actions$
            .pipe(
                ofType(HierarchyActions.deleteHierarchy),
                concatMap(action => this.hierarchyService.deleteHierarchy(action.hierarchyId)
                    .pipe(
                        map(_ => HierarchyActions.deleteHierarchySuccess({ hierarchyId: action.hierarchyId })),
                        catchError(error => of(HierarchyActions.deleteHierarchyFailure({ error })))
                    )
                )
            )
    });
}
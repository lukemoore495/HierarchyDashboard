import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, concatMap, map, mergeMap } from 'rxjs/operators';
import { HierarchyService } from '../hierarchy.service';
import * as HierarchyActions from './hierarchy.actions';

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
            );
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
            );
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
            );
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
            );
    });
    createNode$ = createEffect(() => {
        return this.actions$
            .pipe(
                ofType(HierarchyActions.createNode),
                concatMap(action => this.hierarchyService.createNode(action.hierarchyId, action.parentId, action.node)
                    .pipe(
                        map(node => HierarchyActions.createNodeSuccess({hierarchyId: action.hierarchyId, parentId: action.parentId, node: node})),
                        catchError(error => of(HierarchyActions.createNodeFailure({error})))
                    )
                )
            );
    });
    deleteNode$ = createEffect(() => {
        return this.actions$
            .pipe(
                ofType(HierarchyActions.deleteNode),
                concatMap(action => this.hierarchyService.deleteNode(action.hierarchyId, action.nodeId)
                    .pipe(
                        map(node => HierarchyActions.deleteNodeSuccess({nodeId: action.nodeId, parentNode: node})),
                        catchError(error => of(HierarchyActions.deleteNodeFailure({error})))
                    )
                )
            );
    });
    patchNode$ = createEffect(() => {
        return this.actions$
            .pipe(
                ofType(HierarchyActions.patchNode),
                concatMap(action => this.hierarchyService.patchNode(action.hierarchyId, action.nodeId, action.node)
                    .pipe(
                        map(node => HierarchyActions.patchNodeSuccess({hierarchyId: action.hierarchyId, nodeId: action.nodeId, node: node})),
                        catchError(error => of(HierarchyActions.patchNodeFailure({error})))
                    )
                )
            );
    });
    directAssessment$ = createEffect(() => {
        return this.actions$
            .pipe(
                ofType(HierarchyActions.directAssessment),
                concatMap(action => this.hierarchyService.directAssessment(action.hierarchyId, action.parentId, action.directAssessment)
                    .pipe(
                        map(parentNode => HierarchyActions.updateNodeWeightsSuccess({parentNode})),
                        catchError(error => of(HierarchyActions.updateNodeWeightsFailure({error})))
                    )
                )
            );
    });
    updateAlternativeMeasure$ = createEffect(() => {
        return this.actions$
            .pipe(
                ofType(HierarchyActions.updateAlternativeMeasure),
                concatMap(action => this.hierarchyService.updateAlternativeMeasure(action.hierarchyId, action.alternativeId, action.nodeId, action.measure)
                    .pipe(
                        map(value => HierarchyActions.updateAlternativeMeasureSuccess(
                            {hierarchyId: action.hierarchyId, alternativeId: action.alternativeId, value: value})),
                        catchError(error => of(HierarchyActions.updateAlternativeMeasureFailure({error})))
                    )
                )
            );
    });
    createAlternative$ = createEffect(() => {
        return this.actions$
            .pipe(
                ofType(HierarchyActions.createAlternative),
                concatMap(action => this.hierarchyService.createAlternative(action.createHierarchyAlternative)
                    .pipe(
                        map(alternativeResponse => HierarchyActions.createAlternativeSuccess(
                            { 
                                hierarchyAlternative: {
                                    hierarchyId: alternativeResponse.hierarchyId, 
                                    alternative: alternativeResponse 
                                }
                            })),
                        catchError(error => of(HierarchyActions.createAlternativeFailure({ error })))
                    )
                )
            );
    });
    deleteAlternative$ = createEffect(() => {
        return this.actions$
            .pipe(
                ofType(HierarchyActions.deleteAlternative),
                concatMap(action => this.hierarchyService.deleteAlternative(action.hierarchyAlternative)
                    .pipe(
                        map(_ => HierarchyActions.deleteAlternativeSuccess({ hierarchyAlternative: action.hierarchyAlternative })),
                        catchError(error => of(HierarchyActions.deleteAlternativeFailure({ error })))
                    )
                )
            );
    });
    refreshAlternatives$ = createEffect(() => {
        return this.actions$
            .pipe(
                ofType(HierarchyActions.patchNodeSuccess, HierarchyActions.createNodeSuccess, HierarchyActions.updateWeightsSuccess),
                concatMap(action => this.hierarchyService.getHierarchy(action.hierarchyId)
                    .pipe(
                        map(hierarchy => HierarchyActions.refreshAlternativesSuccess({ alternatives: hierarchy.alternatives })),
                        catchError(error => of(HierarchyActions.refreshAlternativesFailure({ error })))
                    )
                )
            );
    });
}
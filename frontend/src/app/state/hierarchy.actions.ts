import { createAction, props } from "@ngrx/store";
import { Hierarchy } from "../Hierarchy";

export const createHierarchy = createAction(
    '[Hierarchies] Create Hierarchy',
    props<{hierarchy: Hierarchy}>()
);

export const createHierarchySuccess = createAction(
    '[Hierarchies API] Create Hierarchy Success',
    props<{hierarchy: Hierarchy}>()
);

export const createHierarchyFailure = createAction(
    '[Hierarchies API] Create Hierarchy Failure',
    props<{error: string}>()
);

export const retrieveHierarchies = createAction(
    '[Hierachies] Retrieve Hierachies'
);

export const retrieveHierarchiesSuccess = createAction(
    '[Hierarchies API] Retrieve Hierarchies Success',
    props<{hierarchies: Hierarchy[]}>()
);

export const retrieveHierarchiesFailure = createAction(
    '[Hierarchies API] Retrieve Hierarchies Failure',
    props<{error: string}>()
);
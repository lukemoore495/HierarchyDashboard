import { createAction, props } from '@ngrx/store';
import { Hierarchy, HierarchyListItem } from '../Hierarchy';
import { HierarchyRequest } from '../hierarchy.service';

export const createHierarchy = createAction(
    '[Hierarchies] Create Hierarchy',
    props<{ hierarchy: HierarchyRequest }>()
);

export const createHierarchySuccess = createAction(
    '[Hierarchies API] Create Hierarchy Success',
    props<{ hierarchy: Hierarchy }>()
);

export const createHierarchyFailure = createAction(
    '[Hierarchies API] Create Hierarchy Failure',
    props<{ error: string }>()
);

export const retrieveHierarchies = createAction(
    '[Hierarchies] Retrieve Hierachies'
);

export const retrieveHierarchiesSuccess = createAction(
    '[Hierarchies API] Retrieve Hierarchies Success',
    props<{ hierarchies: HierarchyListItem[] }>()
);

export const retrieveHierarchiesFailure = createAction(
    '[Hierarchies API] Retrieve Hierarchies Failure',
    props<{ error: string }>()
);

export const setSelectedHierarchy = createAction(
    '[Hierarchies] Set Selected Hierarchy',
    props<{ selectedHierarchyId: string }>()
);

export const setSelectedHierarchySuccess = createAction(
    '[Hierarchies API] Set Hierarchy Success',
    props<{ hierarchy: Hierarchy }>()
);

export const setSelectedHierarchyFailure = createAction(
    '[Hierarchies API] Set Hierarchy Failure',
    props<{ error: string }>()
);

export const setSelectedAlternative = createAction(
    '[Hierarchies] Set Selected Alternative',
    props<{ selectedAlternativeId: string }>()
);

export const setSelectedMeasurement = createAction(
    '[Hierarchies] Set Selected Measurement',
    props<{ selectedMeasurementId: string | null }>()
);

export const deleteHierarchy = createAction(
    '[Hierarchies] Delete Hierarchy',
    props<{ hierarchyId: string }>()
);

export const deleteHierarchySuccess = createAction(
    '[Hierarchies API] Delete Hierarchy Success',
    props<{ hierarchyId: string }>()
);

export const deleteHierarchyFailure = createAction(
    '[Hierarchies API] Delete Hierarchy Failure',
    props<{ error: string }>()
);
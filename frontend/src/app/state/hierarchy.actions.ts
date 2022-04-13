import { createAction, props } from '@ngrx/store';
import { Hierarchy, HierarchyListItem, Node } from '../Hierarchy';
import { HierarchyRequest, NodeRequest } from '../hierarchy.service';

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

export const createNode = createAction(
    '[Hierarchies] Create Node',
    props<{hierarchyId: string, parentId: string, node: NodeRequest}>()
);

export const createNodeSuccess = createAction(
    '[Hierarchies API] Create Node Success',
    props<{parentId: string, node: Node}>()
);

export const createNodeFailure = createAction(
    '[Hierarchies API] Create Node Failure',
    props<{error: string}>()
);

export const deleteNode = createAction(
    '[Hierarchies] Delete Node',
    props<{hierarchyId: string, nodeId: string}>()
);

export const deleteNodeSuccess = createAction(
    '[Hierarchies API] Delete Node Success',
    props<{nodeId: string}>()
);

export const deleteNodeFailure = createAction(
    '[Hierarchies API] Delete Node Failure',
    props<{error: string}>()
);

export const updateAlternativeMeasure = createAction(
    '[Alternatives] Update Alternative Measure',
    props<{hierarchyId: string, alternativeId: string, nodeId: string, measure: number}>()
);

export const updateAlternativeMeasureSuccess = createAction(
    '[Alternatives API] Update Alternative Measure Success',
    props<{hierarchyId: string, alternativeId: string, nodeId: string, measure: number}>()
);

export const updateAlternativeMeasureFailure = createAction(
    '[Alternatives API] Update Alternative Measure Failure',
    props<{error: string}>()
);
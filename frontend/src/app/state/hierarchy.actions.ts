import { createAction, props } from '@ngrx/store';
import { CreateHierarchyAlternative, HierarchyAlternative } from '../alternatives/AlternativeForm';
import { Alternative, Hierarchy, HierarchyListItem, Node, Value } from '../Hierarchy';
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
    props<{hierarchyId: string, parentId: string, node: Node}>()
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

export const patchNode = createAction(
    '[Hierarchies] Patch Node',
    props<{hierarchyId: string, nodeId: string, node: NodeRequest}>()
);

export const patchNodeSuccess = createAction(
    '[Hierarchies API] Patch Node Success',
    props<{hierarchyId: string, nodeId: string, node: Node}>()
);

export const patchNodeFailure = createAction(
    '[Hierarchies API] Patch Node Failure',
    props<{error: string}>()
);

export const updateAlternativeMeasure = createAction(
    '[Alternatives] Update Alternative Measure',
    props<{hierarchyId: string, alternativeId: string, nodeId: string, measure: number}>()
);

export const updateAlternativeMeasureSuccess = createAction(
    '[Alternatives API] Update Alternative Measure Success',
    props<{hierarchyId: string, alternativeId: string, value: Value}>()
);

export const updateAlternativeMeasureFailure = createAction(
    '[Alternatives API] Update Alternative Measure Failure',
    props<{error: string}>()
);

export const createAlternative = createAction(
    '[Alternatives] Create Hierarchy',
    props<{ createHierarchyAlternative: CreateHierarchyAlternative }>()
);

export const createAlternativeSuccess = createAction(
    '[Alternatives API] Create Alternative Success',
    props<{ hierarchyAlternative: HierarchyAlternative }>()
);

export const createAlternativeFailure = createAction(
    '[Alternatives API] Create Alternative Failure',
    props<{ error: string }>()
);

export const deleteAlternative = createAction(
    '[Alternatives] Delete Alternative',
    props<{ hierarchyAlternative: HierarchyAlternative }>()
);

export const deleteAlternativeSuccess = createAction(
    '[Alternatives API] Delete Alternative Success',
    props<{ hierarchyAlternative: HierarchyAlternative }>()
);

export const deleteAlternativeFailure = createAction(
    '[Alternatives API] Delete Alternative Failure',
    props<{ error: string }>()
);

export const refreshAlternativesSuccess = createAction(
    '[Alternatives API] Refresh Alternatives Success',
    props<{ alternatives: Alternative[] }>()
);

export const refreshAlternativesFailure = createAction(
    '[Alternatives API] Refresh Alternatives Failure',
    props<{ error: string }>()
);
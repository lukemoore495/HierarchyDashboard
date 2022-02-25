import { createReducer, on } from "@ngrx/store";
import { Hierarchy } from "../hierarchy";
import * as HierarchyActions from "./hierarchy.actions";

export interface HierarchyState {
    selectedHierarchyId: string | null;
    Hierarchies: Hierarchy[];
    error: string;
    selectedAlternativeId: string | null;
    selectedMeasurementId: string | null;
}

const initialState: HierarchyState = {
    selectedHierarchyId: null,
    Hierarchies: [],
    error: '',
    selectedAlternativeId: null,
    selectedMeasurementId: null
}

export const HierarchyReducer = createReducer<HierarchyState>(
    initialState,
    on(HierarchyActions.createHierarchySuccess, (state, action): HierarchyState => {
        let hierarchies = state.Hierarchies;
        hierarchies.push(action.hierarchy);
        return {
            ...state,
            Hierarchies: hierarchies
        }
    }),
    on(HierarchyActions.createHierarchyFailure, (state, action): HierarchyState => {
        return {
            ...state,
            error: action.error
        }
    }),
    on(HierarchyActions.retrieveHierarchiesSuccess, (state, action): HierarchyState => {
        return {
            ...state,
            Hierarchies: action.hierarchies,
            selectedHierarchyId: action.hierarchies[0].id,
            selectedAlternativeId: action.hierarchies[0].alternatives[0]?.id
        }
    }),
    on(HierarchyActions.retrieveHierarchiesFailure, (state, action): HierarchyState => {
        return {
            ...state,
            Hierarchies: [],
            error: action.error
        }
    }),
    on(HierarchyActions.setSelectedHierarchy, (state, action): HierarchyState => {
        return {
            ...state,
             selectedHierarchyId: action.selectedHierarchyId,
             selectedAlternativeId: null,
             selectedMeasurementId: null
        }
    }),
    on(HierarchyActions.setSelectedAlternative, (state, action): HierarchyState => {
        return {
            ...state,
             selectedAlternativeId: action.selectedAlternativeId,
             selectedMeasurementId: null
        }
    }),
    on(HierarchyActions.setSelectedMeasurement, (state, action): HierarchyState => {
        return {
            ...state,
             selectedMeasurementId: action.selectedMeasurementId
        }
    })
);
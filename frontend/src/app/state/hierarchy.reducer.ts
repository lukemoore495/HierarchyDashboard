import { createReducer, on } from "@ngrx/store";
import { Hierarchy } from "../Hierarchy";
import * as HierarchyActions from "./hierarchy.actions";

export interface HierarchyState {
    selectedHierarchyId: string | null;
    Hierarchies: Hierarchy[];
    error: string;
}

const initialState: HierarchyState = {
    selectedHierarchyId: null,
    Hierarchies: [],
    error: ''
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
            selectedHierarchyId: action.hierarchies[0].id
        }
    }),
    on(HierarchyActions.retrieveHierarchiesFailure, (state, action): HierarchyState => {
        return {
            ...state,
            Hierarchies: [],
            error: action.error
        }
    })
);
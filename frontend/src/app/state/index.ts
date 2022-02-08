import { createFeatureSelector, createSelector } from "@ngrx/store";
import { HierarchyState } from "./hierarchy.reducer";

const getHierarchyState = createFeatureSelector<HierarchyState>('hierarchies');

export const getSelectedHierarchyId = createSelector(
    getHierarchyState,
    state => state.selectedHierarchyId
);
export const getSelectedHierarchy = createSelector(
    getHierarchyState,
    getSelectedHierarchyId,
    (state, selectedId) => {
        return selectedId ? state.Hierarchies.find(x => x.id === selectedId) : null;
    }
);
export const getHierarchies = createSelector(
    getHierarchyState,
    state => state.Hierarchies
);
export const getError = createSelector(
    getHierarchyState,
    state => state.error
);
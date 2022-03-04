import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Hierarchy, MeasurementDefinition, Node } from '../Hierarchy';
import { HierarchyState } from './hierarchy.reducer';

const getHierarchyState = createFeatureSelector<HierarchyState>('hierarchies');

export const getSelectedHierarchyId = createSelector(
    getHierarchyState,
    state => state.selectedHierarchyId
);
export const getSelectedHierarchy = createSelector(
    getHierarchyState,
    getSelectedHierarchyId,
    (state, selectedId) => {
        return selectedId ? state.Hierarchies?.find(x => x.id === selectedId) ?? null : null;
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

export const getSelectedAlternativeId = createSelector(
    getHierarchyState,
    state => state.selectedAlternativeId
);

export const getSelectedAlternative = createSelector(
    getSelectedHierarchy,
    getSelectedAlternativeId,
    (hierarchy, alternativeId) => {
        return alternativeId ? hierarchy?.alternatives?.find(x => x.id === alternativeId) ?? null : null;
    }
);

export const getSelectedMeasurementId = createSelector(
    getHierarchyState,
    state => state.selectedMeasurementId
);

export const getSelectedMeasurement = createSelector(
    getSelectedAlternative,
    getSelectedMeasurementId,
    (alternative, measurementId) => {
        return measurementId ? alternative?.measurements?.find(x => x.measurementDefinitionId === measurementId) ?? null : null;
    }
);

export const getSelectedMeasurementDefinition = createSelector(
    getSelectedHierarchy,
    getSelectedMeasurementId,
    (hierarchy, measurementId) => {
        return measurementId && hierarchy ? findMeasurementDefinition(hierarchy, measurementId) : null;
    }
);

function findMeasurementDefinition(hierarchy: Hierarchy, measurementDefinitionId: string) : MeasurementDefinition | null {
    const findMeasurementFromNode = (node: Node, measurementDefinitionId: string) : MeasurementDefinition | null => {
        const measurementDefinition = node.measurements?.find(m => m.id == measurementDefinitionId);
        if(measurementDefinition)
            return measurementDefinition;

        if(!node.children || node.children.length === 0)
            return null;

        for(const child of node.children){
            const measurement = findMeasurementFromNode(child, measurementDefinitionId);
            if(measurement)
                return measurement;
        }
        return null;
    };

    for(const node of hierarchy.nodes){
        const measurement = findMeasurementFromNode(node, measurementDefinitionId);
        if(measurement)
            return measurement;
    }
    return null;
}
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Hierarchy, MeasurementDefinition, Node } from '../Hierarchy';
import { HierarchyState } from './hierarchy.reducer';

const getHierarchyState = createFeatureSelector<HierarchyState>('hierarchies');

export const getSelectedHierarchy = createSelector(
    getHierarchyState,
    state => state.selectedHierarchy
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
        return measurementId ? alternative?.values?.find(x => x.nodeId === measurementId) ?? null : null;
    }
);

export const getSelectedMeasurementNode = createSelector(
    getSelectedHierarchy,
    getSelectedMeasurementId,
    (hierarchy, measurementId) => {
        return measurementId && hierarchy ? findMeasurementNode(hierarchy, measurementId) : null;
    }
);

function findMeasurementNode(hierarchy: Hierarchy, nodeId: string) : Node | null {
    const findMeasurementFromNode = (node: Node, nodeId: string) : Node | null => {
        const measurementNode = node.children?.find(m => m.id == nodeId);
        if(measurementNode)
            return measurementNode ?? null;

        if(!node.children || node.children.length === 0)
            return null;

        for(const child of node.children){
            const measurement = findMeasurementFromNode(child, nodeId);
            if(measurement)
                return measurement;
        }
        return null;
    };
    return findMeasurementFromNode(hierarchy.root, nodeId);
}
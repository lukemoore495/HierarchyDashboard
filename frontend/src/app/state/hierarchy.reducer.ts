import { createReducer, on } from '@ngrx/store';
import { Hierarchy, HierarchyListItem, Node } from '../Hierarchy';
import * as HierarchyActions from './hierarchy.actions';
import RRRHierarchy from '../../assets/staticFiles/RRRHierarchy.json';
import CarHierarchy from '../../assets/staticFiles/DemoExample.json';

export interface HierarchyState {
    selectedHierarchy: Hierarchy | null;
    Hierarchies: HierarchyListItem[];
    error: string;
    selectedAlternativeId: string | null;
    selectedMeasurementId: string | null;
}

const initialState: HierarchyState = {
    selectedHierarchy: null,
    Hierarchies: [],
    error: '',
    selectedAlternativeId: null,
    selectedMeasurementId: null
};

export const HierarchyReducer = createReducer<HierarchyState>(
    initialState,
    on(HierarchyActions.createHierarchySuccess, (state, action): HierarchyState => {
        const hierarchies = [...state.Hierarchies];

        hierarchies.push({
            id: action.hierarchy.id,
            description: action.hierarchy.description,
            name: action.hierarchy.name
        });

        //Remove this once we have alternatives in the backend
        const hierarchy = { ...action.hierarchy };
        if (hierarchy.name === 'RRR Hierarchy') {
            hierarchy.alternatives = (RRRHierarchy as Hierarchy).alternatives;
        }

        return {
            ...state,
            Hierarchies: hierarchies,
            selectedHierarchy: hierarchy
        };
    }),
    on(HierarchyActions.createHierarchyFailure, (state, action): HierarchyState => {
        return {
            ...state,
            error: action.error
        };
    }),
    on(HierarchyActions.retrieveHierarchiesSuccess, (state, action): HierarchyState => {
        return {
            ...state,
            Hierarchies: action.hierarchies
        };
    }),
    on(HierarchyActions.retrieveHierarchiesFailure, (state, action): HierarchyState => {
        return {
            ...state,
            Hierarchies: [],
            error: action.error
        };
    }),
    on(HierarchyActions.setSelectedHierarchySuccess, (state, action): HierarchyState => {
        const hierarchy = { ...action.hierarchy };

        //Remove this once we have alternatives in the backend
        if (hierarchy.name === 'RRR Hierarchy') {
            hierarchy.alternatives = (RRRHierarchy as Hierarchy).alternatives;
        } else if (hierarchy.name === 'Best Car') {
            hierarchy.alternatives = (CarHierarchy as Hierarchy).alternatives;
        }

        const alternative = hierarchy.alternatives ? hierarchy.alternatives[0] : null;
        return {
            ...state,
            selectedHierarchy: hierarchy,
            selectedAlternativeId: alternative ? alternative.id : null,
            selectedMeasurementId: null
        };
    }),
    on(HierarchyActions.setSelectedHierarchyFailure, (state, action): HierarchyState => {
        return {
            ...state,
            selectedHierarchy: null,
            selectedAlternativeId: null,
            selectedMeasurementId: null,
            error: action.error
        };
    }),
    on(HierarchyActions.setSelectedAlternative, (state, action): HierarchyState => {
        return {
            ...state,
            selectedAlternativeId: action.selectedAlternativeId
        };
    }),
    on(HierarchyActions.setSelectedMeasurement, (state, action): HierarchyState => {
        return {
            ...state,
            selectedMeasurementId: action.selectedMeasurementId
        };
    }),
    on(HierarchyActions.deleteHierarchySuccess, (state, action): HierarchyState => {

        const hierarchies = state.Hierarchies.filter(x => x.id !== action.hierarchyId);

        return {
            ...state,
            Hierarchies: hierarchies,
            selectedHierarchy: null,
            selectedAlternativeId: null,
            selectedMeasurementId: null
        };
    }),
    on(HierarchyActions.deleteHierarchyFailure, (state, action): HierarchyState => {
        return {
            ...state,
            error: action.error
        };
    }),
    on(HierarchyActions.createNodeSuccess, (state, action): HierarchyState => {
        if(!state.selectedHierarchy){
            return {...state};
        }
        const copyHierarchy: Hierarchy = {...state.selectedHierarchy};
        return {
            ...state,
            selectedHierarchy: addNodeToHierarchy(copyHierarchy, action.parentId, action.node)
        };
    }),
    on(HierarchyActions.createNodeFailure, (state, action): HierarchyState => {
        return {
            ...state,
            error: action.error
        };
    }),
    on(HierarchyActions.deleteNodeSuccess, (state, action): HierarchyState => {
        if(!state.selectedHierarchy){
            return {...state};
        }
        const copyHierarchy: Hierarchy = {...state.selectedHierarchy};
        return {
            ...state,
            selectedHierarchy: removeNodeFromHierarchy(copyHierarchy, action.nodeId)
        };
    }),
    on(HierarchyActions.deleteNodeFailure, (state, action): HierarchyState => {
        return {
            ...state,
            error: action.error
        };
    }),
);

function addNode(node: Node, parentId: string, newNode: Node) : Node {
    if(node.id === parentId){
        const children = [...node.children];
        children.push(newNode);
        return {...node, children: children};
    }

    const children: Node[] = [];
    node.children.forEach(child => children.push(addNode(child, parentId, newNode)));
    return {...node, children: children};
}

function deleteNode(node: Node, nodeId: string) : Node {
    if(!node.children || node.children.length === 0)
        return node;

    const nodeIndex = node.children.findIndex(child => child.id === nodeId);
    if(nodeIndex !== -1){
        const children = [...node.children];
        children.splice(nodeIndex);
        return {...node, children: children};
    }

    const children: Node[] = [];
    node.children.forEach(child => children.push(deleteNode(child, nodeId)));
    return {...node, children: children};
}

function addNodeToHierarchy(hierarchy: Hierarchy, parentId: string, newNode: Node) : Hierarchy {
    const nodes: Node[] = [];
    for(const node of hierarchy.nodes){
        nodes.push(addNode(node, parentId, newNode));
    }
    return {...hierarchy, nodes: nodes};
}

function removeNodeFromHierarchy(hierarchy: Hierarchy, nodeId: string) : Hierarchy {
    const nodeIndex = hierarchy.nodes.findIndex(node => node.id === nodeId);
    if(nodeIndex !== -1){
        const nodes = [...hierarchy.nodes];
        nodes.splice(nodeIndex);
        return {...hierarchy, nodes: nodes};
    }

    const nodes: Node[] = [];
    for(const node of hierarchy.nodes){
        nodes.push(deleteNode(node, nodeId));
    }
    return {...hierarchy, nodes: nodes};
}

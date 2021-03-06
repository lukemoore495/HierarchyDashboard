import { createReducer, on } from '@ngrx/store';
import { Alternative, Hierarchy, HierarchyListItem, Node } from '../Hierarchy';
import * as HierarchyActions from './hierarchy.actions';

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

        const alternatives = [...action.hierarchy.alternatives];

        return {
            ...state,
            Hierarchies: hierarchies,
            selectedHierarchy: {...action.hierarchy, alternatives: alternatives}
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
        const alternative = action.hierarchy.alternatives ? action.hierarchy.alternatives[0] : null;
        const alternatives = [...action.hierarchy.alternatives];

        return {
            ...state,
            selectedHierarchy: {...action.hierarchy, alternatives},
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
        
        const copyHierarchy: Hierarchy = { ...state.selectedHierarchy };
        return {
            ...state,
            selectedHierarchy: replaceNodeInHierarchy(copyHierarchy, action.node)
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

        const alternatives: Alternative[] = [];
        state.selectedHierarchy.alternatives.forEach(alternative => {
            const values = alternative.values.filter(value => value.nodeId !== action.nodeId);
            alternatives.push({
                ...alternative,
                values: values
            });
        });


        const hierarchy: Hierarchy = {...state.selectedHierarchy, alternatives: alternatives};
        return {
            ...state,
            selectedHierarchy: replaceNodeInHierarchy(hierarchy, action.parentNode)
        };
    }),
    on(HierarchyActions.deleteNodeFailure, (state, action): HierarchyState => {
        return {
            ...state,
            error: action.error
        };
    }),
    on(HierarchyActions.patchNodeSuccess, (state, action): HierarchyState => {
        if(!state.selectedHierarchy){
            return {...state};
        }
        
        const copyHierarchy: Hierarchy = { ...state.selectedHierarchy };
        return {
            ...state,
            selectedHierarchy: replaceNodeInHierarchy(copyHierarchy, action.node)
        };
    }),
    on(HierarchyActions.patchNodeFailure, (state, action): HierarchyState => {
        return {
            ...state,
            error: action.error
        };
    }),
    on(HierarchyActions.updateNodeWeightsSuccess, (state, action): HierarchyState => {
        if(!state.selectedHierarchy){
            return {...state};
        }
        
        return {
            ...state,
            selectedHierarchy: replaceNodeInHierarchy(state.selectedHierarchy, action.parentNode)
        };
    }),
    on(HierarchyActions.updateNodeWeightsFailure, (state, action): HierarchyState => {
        return {
            ...state,
            error: action.error
        };
    }),
    on(HierarchyActions.updateAlternativeMeasureSuccess, (state, action): HierarchyState => {
        if(!state.selectedHierarchy || action.hierarchyId != state.selectedHierarchy.id){
            return {...state};
        }

        const alternative = state.selectedHierarchy.alternatives.find(x => x.id === action.alternativeId);
        if(!alternative){
            return {...state};
        }

        const values = alternative.values.filter(x => x.nodeId !== action.value.nodeId);
        values.push(action.value);

        const alternatives = [...state.selectedHierarchy.alternatives]
            .filter(x => x.id !== action.alternativeId);
        alternatives.push({...alternative, values: values});

        const copyHierarchy = {...state.selectedHierarchy, alternatives: alternatives};

        return {
            ...state,
            selectedHierarchy: copyHierarchy
        };
    }),
    on(HierarchyActions.updateAlternativeMeasureFailure, (state, action): HierarchyState => {
        return {
            ...state,
            error: action.error
        };
    }),
    on(HierarchyActions.createAlternativeSuccess, (state, action): HierarchyState => {
        if(state.selectedHierarchy === null 
            || state.selectedHierarchy.id !== action.hierarchyAlternative.hierarchyId){
            return {
                ...state,
                selectedHierarchy: null,
                selectedAlternativeId: null
            };
        }

        const alternatives = [...state.selectedHierarchy.alternatives];
        alternatives.push(action.hierarchyAlternative.alternative);

        const hierarchy = {
            ...state.selectedHierarchy,
            alternatives: alternatives
        };;
        
        return {
            ...state,
            selectedHierarchy: hierarchy,
            selectedAlternativeId: action.hierarchyAlternative.alternative.id
        };
    }),
    on(HierarchyActions.createAlternativeFailure, (state, action): HierarchyState => {
        return {
            ...state,
            error: action.error
        };
    }),
    on(HierarchyActions.deleteAlternativeSuccess, (state, action): HierarchyState => {
        if(state.selectedHierarchy === null 
            || state.selectedHierarchy.id !== action.hierarchyAlternative.hierarchyId){
            return {
                ...state,
                selectedHierarchy: null,
                selectedAlternativeId: null
            };
        }

        const alternatives = state.selectedHierarchy.alternatives
            .filter(x => x.id !== action.hierarchyAlternative.alternative.id);

        const hierarchy = {
            ...state.selectedHierarchy,
            alternatives: alternatives
        };
        
        return {
            ...state,
            selectedHierarchy: hierarchy,
            selectedAlternativeId: alternatives.length > 0 ? alternatives[0].id : null
        };
    }),
    on(HierarchyActions.deleteAlternativeFailure, (state, action): HierarchyState => {
        return {
            ...state,
            error: action.error
        };
    }),
    on(HierarchyActions.refreshAlternativesSuccess, (state, action): HierarchyState => {
        if(!state.selectedHierarchy){
            return {...state};
        }

        return {
            ...state,
            selectedHierarchy: {
                ...state.selectedHierarchy, 
                alternatives: action.alternatives
            }
        };
    }),
    on(HierarchyActions.retrieveHierarchiesFailure, (state, action): HierarchyState => {
        return {
            ...state,
            error: action.error
        };
    }),
);

function replaceNode(node: Node, newNode: Node) : Node {
    if(node.id === newNode.id){
        return newNode;
    }

    const children: Node[] = [];
    node.children.forEach(child => children.push(replaceNode(child, newNode)));
    return {...node, children: children};
}

function deleteNode(node: Node, nodeId: string) : Node {
    if(!node.children || node.children.length === 0)
        return node;

    const nodeIndex = node.children.findIndex(child => child.id === nodeId);
    if(nodeIndex !== -1){
        const children = [...node.children];
        children.splice(nodeIndex, 1);
        return {...node, children: children};
    }

    const children: Node[] = [];
    node.children.forEach(child => children.push(deleteNode(child, nodeId)));
    return {...node, children: children};
}

function replaceNodeInHierarchy(hierarchy: Hierarchy, newNode: Node) : Hierarchy {
    const node = replaceNode(hierarchy.root, newNode);
    return {...hierarchy, root: node};
}

function removeNodeFromHierarchy(hierarchy: Hierarchy, nodeId: string) : Hierarchy {
    const node = deleteNode(hierarchy.root, nodeId);
    return {...hierarchy, root: node};
}

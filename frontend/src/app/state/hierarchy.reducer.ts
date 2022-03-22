import { createReducer, on } from '@ngrx/store';
import { Hierarchy, HierarchyListItem } from '../Hierarchy';
import * as HierarchyActions from './hierarchy.actions';
import RRRHierarchy from '../../assets/staticFiles/RRRHierarchy.json';
import SimpleHierarchy from '../../assets/staticFiles/SimpleHierarchy.json';
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
        
        const existingHierarchyIndex = hierarchies.findIndex(x => x.id === action.hierarchy.id);
        if(existingHierarchyIndex !== -1) {
            hierarchies.splice(existingHierarchyIndex);
        }

        hierarchies.push({
            id: action.hierarchy.id,
            description: action.hierarchy.description,
            name: action.hierarchy.name
        });

        //Remove this once we have alternatives in the backend
        const hierarchy = {...action.hierarchy};
        if(hierarchy.name === 'RRR Hierarchy'){
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
        const hierarchy = {...action.hierarchy};  

        //Remove this once we have alternatives in the backend
        if(hierarchy.name === 'RRR Hierarchy'){
            hierarchy.alternatives = (RRRHierarchy as Hierarchy).alternatives;
        } else if (hierarchy.name === 'Car') {
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
            selectedAlternativeId: action.selectedAlternativeId,
            selectedMeasurementId: null
        };
    }),
    on(HierarchyActions.setSelectedMeasurement, (state, action): HierarchyState => {
        return {
            ...state,
            selectedMeasurementId: action.selectedMeasurementId
        };
    })
);
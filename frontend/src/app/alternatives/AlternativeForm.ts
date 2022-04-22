import { Alternative, Value } from '../Hierarchy';

export interface CreateHierarchyAlternative {
    hierarchyId: string;
    name: string;
}

export interface HierarchyAlternative {
    hierarchyId: string;
    alternative: Alternative;
}

export interface CreateAlternativeResponse {
    id: string;
    name: string;
    hierarchyId: string;
    values: Value[];
}

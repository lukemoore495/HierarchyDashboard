import { Alternative } from "../Hierarchy";

export interface CreateHierarchyAlternative {
    hierarchyId: string;
    name: string;
}

export interface HierarchyAlternative {
    hierarchyId: string;
    alternative: Alternative;
}

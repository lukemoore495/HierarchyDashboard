import { Alternative } from "../Hierarchy";

export interface CreateAlternativeForm {
    hierarchyId: string;
    name: string;
}

export interface CreateAlternativeResponse {
    hierarchyId: string;
    alternative: Alternative;
}

export interface DeleteAlternativeForm {
    hierarchyId: string;
    alternative: Alternative;
}

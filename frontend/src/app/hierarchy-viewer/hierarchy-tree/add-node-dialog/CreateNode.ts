import { MeasurementType } from '../../../Hierarchy';

export interface CreateNodeForm {
    isMeasurement: boolean;
    measurementType: MeasurementType | null;
    name: string;
}

export interface CreateNodeData {
    parentId: string;
    hierarchyId: string;
}
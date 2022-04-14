import { MeasurementType } from '../../../Hierarchy';

export interface CreateNodeForm {
    isMeasurement: boolean;
    measurementType: MeasurementType | null;
    name: string;
    point1: PointForm;
    point2: PointForm;
}

export interface PointForm{
    x: number | null;
    y: number | null;
}

export interface CreateNodeData {
    parentId: string;
    hierarchyId: string;
}
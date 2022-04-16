import { MeasurementType, Node } from '../../../Hierarchy';

export interface NodeForm {
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

export interface NodeDialogData {
    parentId?: string;
    existingNode?: Node;
    hierarchyId: string;
}
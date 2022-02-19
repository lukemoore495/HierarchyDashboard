export interface Hierarchy {
    id : string;
    name: string;
    description: string;
    nodes: Node[];
    alternatives: Alternative[];
}

export interface Node {
    name: string;
    weight: number;
    children?: Node[];
    icon?: string;
    measurements?: MeasurementDefinition[];
}

export interface MeasurementDefinition {
    measurementName: string;
    measurementType: string;
    valueFunction?: ValueFunction;
}

export enum MeasurementType {
    Number,
    Percentage,
    Boolean
}

export interface ValueFunction {
    upperBound: number;
    lowerBound: number;
    rowCategories: Category[];
    columnCategories: Category[];
    type: ValueFunctionTypes;
}

export interface Category {
    name: string;
    value: number;
}

export enum ValueFunctionTypes {
    Increasing,
    Decreasing,
    OneDimension,
    TwoDimension
}

export interface Alternative {
    name: string;
    measurements: Measurement;
    rank: number;
}

export interface Measurement {
    leafNode: Node;
    measure: number;
    value: number;
}
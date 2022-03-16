export interface HierarchyListItem {
    id: string;
    name: string;
    description: string;
}

export interface Hierarchy {
    id : string;
    name: string;
    description: string;
    nodes: Node[];
    alternatives: Alternative[];
}

export interface Node {
    id: string
    name: string;
    weight: number;
    children: Node[];
    icon?: string;
    measurements: MeasurementDefinition[];
}

export interface MeasurementDefinition {
    id: string;
    name: string;
    type: string;
    valueFunction?: ValueFunction;
}

export enum MeasurementType {
    Number = "Number",
    Percentage = "Percentage",
    Boolean = "Boolean"
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
    id: string;
    name: string;
    measurements: Measurement[];
}

export interface Measurement {
    measurementDefinitionId: string;
    measure?: number;
    value?: number;
    valueFunctionData?: Point[];
}

export interface Point{
    x: number;
    y: number;
}
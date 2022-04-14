export interface HierarchyListItem {
    id: string;
    name: string;
    description: string;
}

export interface Hierarchy {
    id : string;
    name: string;
    description: string;
    root: Node;
    alternatives: Alternative[];
}

export interface Node {
    id: string
    name: string;
    weight: number;
    children: Node[];
    measurementDefinition?: MeasurementDefinition;
    icon: string | null;
}

export interface MeasurementDefinition {
    measurementType: string | null;
    valueFunction?: ValueFunction;
    valueFunctionData?: Point[];
}

export enum MeasurementType {
    Number = 'Number',
    Percentage = 'Percentage',
    Boolean = 'Boolean'
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
    values: Value[];
}

export interface Value {
    nodeId: string;
    measure: number | null;
    localValue?: number | null;
    globalValue?: number | null;
}

export interface Point{
    x: number;
    y: number;
}

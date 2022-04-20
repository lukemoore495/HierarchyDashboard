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
    valueFunctionType?: VFType;
    valueFunctionData?: Point[];
    referencePoints?: Point[];
    categories?: Category[];
}

export enum MeasurementType {
    Number = 'Number',
    Percentage = 'Percentage',
    Boolean = 'Boolean',
    //Discrete = 'Discrete'
}

export interface Category {
    name: string;
    measure: string;
    value: number;
}

export enum VFType {
    Linear,
    Categorical
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

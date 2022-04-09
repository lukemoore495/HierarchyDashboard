import { Injectable } from '@angular/core';
import { Alternative, Hierarchy, HierarchyListItem, ValueFunction, Node, MeasurementType } from './Hierarchy';
import { Observable, of } from 'rxjs';
import { SensitivityAnalysisReport } from './sensitivity-analysis/SensitivityAnalysis';
import { HttpClient } from '@angular/common/http';
import { SwingWeight } from './weights/swing-weight/SwingWeight';

export interface HierarchyRequest {
    name: string;
    description: string;
    root: NodeRequest;
    alternatives?: Alternative[];
}

export interface NodeRequest {
    name: string;
    weight: number;
    children: NodeRequest[];
    icon: string | null;
    measurementDefinition?: MeasurementDefinitionRequest;
}

export interface AlternativeRequest {
    name: string;
    measurements: MeasurementRequest[];
}

export interface MeasurementRequest {
    nodeId: string;
    measure?: number;
}

export interface MeasurementDefinitionRequest {
    measurementType: MeasurementType;
    valueFunction?: ValueFunction | null;
}

export interface DirectAssessment {
    nodeId: string;
    weight: number;
}

export interface PairwiseComparisonRequest {
    nodeId: string;
    pairComparison: PairComparison[];
}
export interface PairComparison {
    nodeId: string;
    comparison: number;
}

@Injectable({
    providedIn: 'root'
})
export class HierarchyService {
    //root = 'http://localhost:4200/api';
    root = 'http://localhost:5000';

    constructor(private http: HttpClient) { }

    getHierarchies(): Observable<HierarchyListItem[]> {
        const url = this.root + '/hierarchy/ascending_id';
        return this.http.get<HierarchyListItem[]>(url);
    }

    getHierarchy(id: string) {
        const url = this.root + `/hierarchy/${id}`;
        return this.http.get<Hierarchy>(url);
    }

    createHierarchy(hierarchy: HierarchyRequest): Observable<Hierarchy> {
        const url = this.root + '/hierarchy';
        return this.http.post<Hierarchy>(url, hierarchy);
    }

    deleteHierarchy(hierarchyId: string): Observable<string> {
        const url = this.root + '/hierarchy/' + hierarchyId;
        return this.http.delete<string>(url);
    }

    createNode(hierarchyId: string, parentId: string, node: NodeRequest): Observable<Node> {
        const url = this.root + `/hierarchy/${hierarchyId}/node/${parentId}`;
        return this.http.post<Node>(url, node);
    }

    deleteNode(hierarchyId: string, nodeId: string): Observable<string> {
        const url = this.root + `/hierarchy/${hierarchyId}/node/${nodeId}`;
        return this.http.delete<string>(url);
    }

    // patchNode(hierarchyId: string, nodeId: string, node: NodeRequest): Observable<Node> {
    //     const url = this.root + `/hierarchy/${hierarchyId}/node/${nodeId}`;
    //     return this.http.patch<Node>(url, node);
    // }

    exportHierarchy(hierarchyId: string): Observable<HierarchyRequest> {
        const url = this.root + `/hierarchy/${hierarchyId}/export` ;
        return this.http.get<HierarchyRequest>(url);
    }

    // createAlternative(hierarchyId: string, alternative: AlternativeRequest): Alternative {}

    // deleteAlternative(hierarchyId: string, alternativeId: string: string {}

    // updateAlternativeMeasure(hierarchyId: string, alternativeId: string, nodeId: string, measurement: number): Alternative {}

    // getValueFunctionPoint(hierarchyId: string, nodeId: string, xValue: number): Point{}

    // directAssessment(hierarchyId: string, nodeId: string, directAssessments: DirectAssessment[]): Node {}

    // pairwiseComparison(hierarchyId: string, nodeId: string, pairwiseComparisons: PairwiseComparisons[]): Node {}

    // swingWeight(hierarchyId: string, nodeId: string, swingWeight: SwingWeight[]): Node {}

    // editSwingWeightMatrix(hierarchyId: string, nodeId: string, swingValues: number[]): Node {}

    getFakeSensitivityAnalysis(nodeNames: string[]): Observable<SensitivityAnalysisReport>{
        return of(this.getFakeSensitivityAnalysisData(nodeNames));
    }

    getSensitivityAnalysis(parentNodeId: string): Observable<SensitivityAnalysisReport> {
        return of(this.getFakeSensitivityAnalysisData([
            'Security', 'Justice', 'Economic Opportunities', 'Education', 'Socio Economic']));
    }

    getFakeSensitivityAnalysisData(nodeNames: string[]): SensitivityAnalysisReport {
        return {
            report: [
                {
                    globalValue: 0,
                    data: [
                        {
                            data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                            name: nodeNames[0],
                        },
                        {
                            data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                            name: nodeNames[1]
                        },
                        {
                            data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                            name: nodeNames[2],
                        },
                        {
                            data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                            name: nodeNames[3],
                        },
                        {
                            data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                            name: nodeNames[4]
                        }
                    ]
                },
                {
                    globalValue: 0.1,
                    data: [
                        {
                            data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                            name: nodeNames[0],
                        },
                        {
                            data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                            name: nodeNames[1]
                        },
                        {
                            data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                            name: nodeNames[2],
                        },
                        {
                            data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                            name: nodeNames[3],
                        },
                        {
                            data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                            name: nodeNames[4]
                        }
                    ]
                },
                {
                    globalValue: 0.2,
                    data: [
                        {
                            data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                            name: nodeNames[0],
                        },
                        {
                            data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                            name: nodeNames[1]
                        },
                        {
                            data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                            name: nodeNames[2],
                        },
                        {
                            data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                            name: nodeNames[3],
                        },
                        {
                            data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                            name: nodeNames[4]
                        }
                    ]
                },
                {
                    globalValue: 0.3,
                    data: [
                        {
                            data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                            name: nodeNames[0],
                        },
                        {
                            data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                            name: nodeNames[1]
                        },
                        {
                            data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                            name: nodeNames[2],
                        },
                        {
                            data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                            name: nodeNames[3],
                        },
                        {
                            data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                            name: nodeNames[4]
                        }
                    ]
                },
                {
                    globalValue: 0.4,
                    data: [
                        {
                            data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                            name: nodeNames[0],
                        },
                        {
                            data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                            name: nodeNames[1]
                        },
                        {
                            data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                            name: nodeNames[2],
                        },
                        {
                            data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                            name: nodeNames[3],
                        },
                        {
                            data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                            name: nodeNames[4]
                        }
                    ]
                },
                {
                    globalValue: 0.5,
                    data: [
                        {
                            data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                            name: nodeNames[0],
                        },
                        {
                            data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                            name: nodeNames[1]
                        },
                        {
                            data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                            name: nodeNames[2],
                        },
                        {
                            data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                            name: nodeNames[3],
                        },
                        {
                            data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                            name: nodeNames[4]
                        }
                    ]
                },
                {
                    globalValue: 0.6,
                    data: [
                        {
                            data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                            name: nodeNames[0],
                        },
                        {
                            data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                            name: nodeNames[1]
                        },
                        {
                            data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                            name: nodeNames[2],
                        },
                        {
                            data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                            name: nodeNames[3],
                        },
                        {
                            data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                            name: nodeNames[4]
                        }
                    ]
                },
                {
                    globalValue: 0.7,
                    data: [
                        {
                            data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                            name: nodeNames[0],
                        },
                        {
                            data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                            name: nodeNames[1]
                        },
                        {
                            data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                            name: nodeNames[2],
                        },
                        {
                            data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                            name: nodeNames[3],
                        },
                        {
                            data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                            name: nodeNames[4]
                        }
                    ]
                },
                {
                    globalValue: 0.8,
                    data: [
                        {
                            data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                            name: nodeNames[0],
                        },
                        {
                            data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                            name: nodeNames[1]
                        },
                        {
                            data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                            name: nodeNames[2],
                        },
                        {
                            data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                            name: nodeNames[3],
                        },
                        {
                            data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                            name: nodeNames[4]
                        }
                    ]
                },
                {
                    globalValue: 0.9,
                    data: [
                        {
                            data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                            name: nodeNames[0],
                        },
                        {
                            data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                            name: nodeNames[1]
                        },
                        {
                            data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                            name: nodeNames[2],
                        },
                        {
                            data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                            name: nodeNames[3],
                        },
                        {
                            data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                            name: nodeNames[4]
                        }
                    ]
                },
                {
                    globalValue: 1,
                    data: [
                        {
                            data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                            name: nodeNames[0],
                        },
                        {
                            data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                            name: nodeNames[1]
                        },
                        {
                            data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                            name: nodeNames[2],
                        },
                        {
                            data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                            name: nodeNames[3],
                        },
                        {
                            data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                            name: nodeNames[4]
                        }
                    ]
                }
            ]
        };
    }
}
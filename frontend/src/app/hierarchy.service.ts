import { Injectable } from "@angular/core";
import { Hierarchy, HierarchyListItem } from "./hierarchy";
import { Observable, of } from "rxjs";
import { SensitivityAnalysisReport } from "./sensitivity-analysis/SensitivityAnalysis";
import { HttpClient } from "@angular/common/http";

export interface HierarchyRequest {
    name: string;
    description: string;
    nodes: NodeRequest[];
}

export interface NodeRequest {
    name: string;
    weight: number;
    children: NodeRequest[];
    icon?: string;
    measurements: MeasurementDefinitionRequest[];
}

export interface MeasurementDefinitionRequest {
    name: string;
    type: string;
}

@Injectable({
    providedIn: 'root'
})
export class HierarchyService {
    root = '/api';

    constructor(private http: HttpClient){ }

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

    getSensitivityAnalysis(parentNodeId: string): Observable<SensitivityAnalysisReport>{
        return of(this.staticSensitivityAnalysisReport);
    }

    staticSensitivityAnalysisReport: SensitivityAnalysisReport = {
        report: [
                    {
                        globalValue: 0,
                        data: [
                            {
                                data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                                name: 'Security',
                            },
                            {
                                data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                                name: 'Justice'
                            },
                            {
                                data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                                name: 'Economic Opportunities',
                            },
                            {
                                data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                                name: 'Education',
                            },
                            {
                                data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                                name: 'Socio Economic'
                            }
                        ]
                    },
                    {
                        globalValue: 0.1,
                        data: [
                            {
                                data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                                name: 'Security',
                            },
                            {
                                data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                                name: 'Justice'
                            },
                            {
                                data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                                name: 'Economic Opportunities',
                            },
                            {
                                data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                                name: 'Education',
                            },
                            {
                                data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                                name: 'Socio Economic'
                            }
                        ]
                    },
                    {
                        globalValue: 0.2,
                        data: [
                            {
                                data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                                name: 'Security',
                            },
                            {
                                data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                                name: 'Justice'
                            },
                            {
                                data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                                name: 'Economic Opportunities',
                            },
                            {
                                data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                                name: 'Education',
                            },
                            {
                                data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                                name: 'Socio Economic'
                            }
                        ]
                    },
                    {
                        globalValue: 0.3,
                        data: [
                            {
                                data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                                name: 'Security',
                            },
                            {
                                data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                                name: 'Justice'
                            },
                            {
                                data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                                name: 'Economic Opportunities',
                            },
                            {
                                data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                                name: 'Education',
                            },
                            {
                                data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                                name: 'Socio Economic'
                            }
                        ]
                    },
                    {
                        globalValue: 0.4,
                        data: [
                            {
                                data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                                name: 'Security',
                            },
                            {
                                data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                                name: 'Justice'
                            },
                            {
                                data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                                name: 'Economic Opportunities',
                            },
                            {
                                data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                                name: 'Education',
                            },
                            {
                                data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                                name: 'Socio Economic'
                            }
                        ]
                    },
                    {
                        globalValue: 0.5,
                        data: [
                            {
                                data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                                name: 'Security',
                            },
                            {
                                data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                                name: 'Justice'
                            },
                            {
                                data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                                name: 'Economic Opportunities',
                            },
                            {
                                data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                                name: 'Education',
                            },
                            {
                                data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                                name: 'Socio Economic'
                            }
                        ]
                    },
                    {
                        globalValue: 0.6,
                        data: [
                            {
                                data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                                name: 'Security',
                            },
                            {
                                data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                                name: 'Justice'
                            },
                            {
                                data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                                name: 'Economic Opportunities',
                            },
                            {
                                data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                                name: 'Education',
                            },
                            {
                                data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                                name: 'Socio Economic'
                            }
                        ]
                    },
                    {
                        globalValue: 0.7,
                        data: [
                            {
                                data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                                name: 'Security',
                            },
                            {
                                data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                                name: 'Justice'
                            },
                            {
                                data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                                name: 'Economic Opportunities',
                            },
                            {
                                data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                                name: 'Education',
                            },
                            {
                                data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                                name: 'Socio Economic'
                            }
                        ]
                    },
                    {
                        globalValue: 0.8,
                        data: [
                            {
                                data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                                name: 'Security',
                            },
                            {
                                data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                                name: 'Justice'
                            },
                            {
                                data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                                name: 'Economic Opportunities',
                            },
                            {
                                data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                                name: 'Education',
                            },
                            {
                                data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                                name: 'Socio Economic'
                            }
                        ]
                    },
                    {
                        globalValue: 0.9,
                        data: [
                            {
                                data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                                name: 'Security',
                            },
                            {
                                data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                                name: 'Justice'
                            },
                            {
                                data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                                name: 'Economic Opportunities',
                            },
                            {
                                data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                                name: 'Education',
                            },
                            {
                                data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                                name: 'Socio Economic'
                            }
                        ]
                    },
                    {
                        globalValue: 1,
                        data: [
                            {
                                data: [1, 0.95, 0.9, 0.85, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45],
                                name: 'Security',
                            },
                            {
                                data: [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
                                name: 'Justice'
                            },
                            {
                                data: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
                                name: 'Economic Opportunities',
                            },
                            {
                                data: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
                                name: 'Education',
                            },
                            {
                                data: [0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0],
                                name: 'Socio Economic'
                            }
                        ]
                    }
                ]
    }
}
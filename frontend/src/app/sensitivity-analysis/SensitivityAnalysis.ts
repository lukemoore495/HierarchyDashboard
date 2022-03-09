export interface SensitivityAnalysisReport {
    report: SensitivityAnalysis[];
}

export interface SensitivityAnalysis {
    globalValue: number;
    data: NodeLineData[];
}

export interface NodeLineData {
    name: string;
    data: number[];
}
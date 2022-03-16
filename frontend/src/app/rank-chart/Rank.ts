export interface Rank {
    alternativeName: string,
    values: RankValue[],
    total: number
}

export interface RankValue {
    value: number,
    name: string | null
}

export interface RankChartData {
    values: number[],
    label: string | null
}


export interface CellData {
    weightY: number;  // Relative height along Y-axis.
    bgcolor: string;
    title: string;  // Title: short phrase.
    lorem: string;  // Lorem: dummy lorem ipsum text.
};

export type ColumnLayoutData = CellData[];
export type MasonryLayoutData = ColumnLayoutData[];

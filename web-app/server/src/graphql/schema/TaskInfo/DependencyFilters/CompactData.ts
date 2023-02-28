import {
    Ar,
    Cfd,
    Fd,
    PieChartRow,
    PieChartRowWithPattern,
    PieChartWithPatterns,
    PieChartWithoutPatterns,
} from "../../../types/types";

export type Item = { columnIndex: number; patternIndex: number };

export type ARCompactType = { lhs: number[]; rhs: number[]; confidence: number };
export type FDCompactType = { lhs: number[]; rhs: number };
export type CFDCompactType = {
    lhs: Item[];
    rhs: Item;
    support: number;
    confidence: number;
};
export type MFDCluster = {
  value: string
  highlightsTotalCount: number
  highlights: MFDHighlight[]
}
export type MFDHighlight = {
    index: number;
    withinLimit: boolean;
    maximumDistance: number;
    furthestPointIndex: number;
    value: string;
};

export type ItemsInfo = { itemValues: string[] };
export type ColumnsInfo = { columnNames: string[]; columnIndicesOrder: number[] };

export class CompactData {
    public static toCompactDeps = <T>(
        data: string,
        transform: (dep: string) => T,
        sep = ";"
    ) => {
        return data
            .split(sep)
            .filter((str) => str.length > 0)
            .map(transform);
    };

    ///

    public static toCompactAR = (data: string): ARCompactType => {
        const rule = data.split(":").map((compact) => compact.split(",").map(Number));
        return { lhs: rule[1], rhs: rule[2], confidence: rule[0][0] };
    };

    public static toCompactCFD = (data: string): CFDCompactType => {
        const [confidence, lhs, rhs, support] = data.split(":");
        return {
            lhs: lhs
                .split(",")
                .filter((line) => line.length)
                .map(CompactData.toItem),
            rhs: CompactData.toItem(rhs),
            support: Number(support),
            confidence: Number(confidence),
        };
    };

    public static toCompactFD = (data: string): FDCompactType => {
        const dep = data.split(",").map(Number);
        return { lhs: dep.slice(0, dep.length - 1), rhs: dep[dep.length - 1] };
    };
    
    public static findMFDClusterRow = (data: string, clusterIndex: number, rowIndex: number): MFDHighlight | undefined => {
        const cluster = CompactData.toCompactMFDClusters(data)[clusterIndex];
        
        return cluster.highlights.find((highlight: MFDHighlight) => {
            return highlight.index === rowIndex;
        });
    };

    public static toCompactMFDClusters = (data: string): MFDCluster[] => {
        const clusters = data.split("\n\n");

        return clusters.map((cluster) => {
          const highlights = cluster.split("\n");
          return {
            value: highlights[0],
            highlightsTotalCount: highlights.length - 1,
            highlights: highlights.slice(1).map((highlight) => {
              const parts = highlight.split(";");
              return {
                  withinLimit: parts[0] == "1",
                  value: parts[1],
                  index: Number(parts[2]),
                  furthestPointIndex: Number(parts[3]),
                  maximumDistance: Number(parts[4]),
                };
            }),
          };
        });
    };

    ///

    public static toItem = (data: string): Item => {
        const [columnIndex, patternIndex] = data.split("=").map(Number);
        return { columnIndex, patternIndex };
    };

    public static toAR = (
        { lhs, rhs, confidence }: ARCompactType,
        { itemValues }: ItemsInfo
    ): Ar => {
        const getItem = (id: number) => itemValues[id];
        return { lhs: lhs.map(getItem), rhs: rhs.map(getItem), confidence };
    };

    public static FDtoIndices = ({ lhs, rhs }: Fd) => [
        ...lhs.map(({ index }) => index),
        rhs.index,
    ];

    public static toFD = (
        { lhs, rhs }: FDCompactType,
        { columnNames }: Omit<ColumnsInfo, "columnIndicesOrder">
    ): Fd => {
        const getColumn = (index: number) => ({ name: columnNames[index], index });
        return { lhs: lhs.map(getColumn), rhs: getColumn(rhs) };
    };

    public static toCFD = (
        { lhs, rhs, support, confidence }: CFDCompactType,
        { columnNames }: Omit<ColumnsInfo, "columnIndicesOrder">,
        { itemValues }: ItemsInfo
    ): Cfd => {
        const getColumn = (index: number) => ({ name: columnNames[index], index });
        const getItem = ({ columnIndex, patternIndex }: Item) => ({
            column: getColumn(columnIndex),
            pattern: itemValues[patternIndex],
        });
        return { lhs: lhs.map(getItem), rhs: getItem(rhs), support, confidence };
    };

    ///

    public static toPieChartWithPatternsRow = (
        [index, value, patternValueId]: number[],
        { columnNames }: ColumnsInfo,
        { itemValues }: ItemsInfo
    ): PieChartRowWithPattern => ({
        column: { index, name: columnNames[index] },
        value,
        pattern: itemValues[patternValueId],
    });

    public static toFDPieChartRow = (
        [index, value]: number[],
        { columnNames }: ColumnsInfo
    ): PieChartRow => ({ column: { index, name: columnNames[index] }, value });

    public static toPieChartBase = <T>(
        data: string,
        toChartRow: (data: number[]) => T
    ) => {
        const [lhs, rhs] = data.split("|");

        const transformFromCompactData = (item: string) => {
            return item
                .split(";")
                .filter((str) => str.length > 0)
                .map((indices) => indices.split(",").map(Number))
                .map(toChartRow);
        };
        return { lhs: transformFromCompactData(lhs), rhs: transformFromCompactData(rhs) };
    };

    public static toPieChartWithPattern = (
        data: string,
        columnsInfo: ColumnsInfo,
        itemsInfo: ItemsInfo
    ): PieChartWithPatterns => {
        return CompactData.toPieChartBase(data, (row) =>
            CompactData.toPieChartWithPatternsRow(row, columnsInfo, itemsInfo)
        );
    };

    public static toPieChartWithoutPattern = (
        data: string,
        columnsInfo: ColumnsInfo
    ): PieChartWithoutPatterns => {
        return CompactData.toPieChartBase(data, (row) =>
            CompactData.toFDPieChartRow(row, columnsInfo)
        );
    };

    public static toClusterWithSuspiciousIndices = (
        rowIndicesData: string,
        suspiciousIndicesData: string
    ) => {
        const suspiciousIndices = new Set(suspiciousIndicesData.split(",").map(Number));
        const rowIndices = rowIndicesData.split(",").map(Number);
        return { rowIndices, suspiciousIndices };
    };
}

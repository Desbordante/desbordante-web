import {
    Ar,
    Cfd,
    Fd,
    Mfd,
    PieChartRow,
    PieChartRowWithPattern,
    PieChartWithPatterns,
    PieChartWithoutPatterns,
} from "../../../types/types";
import { ApolloError } from "apollo-server-errors";

export type Item = { columnIndex: number; patternIndex: number };

export type ARCompactType = { lhs: number[]; rhs: number[]; confidence: number };
export type FDCompactType = { lhs: number[]; rhs: number };
export type CFDCompactType = {
    lhs: Item[];
    rhs: Item;
    support: number;
    confidence: number;
};
export type MFDCompactType = {
    index: number;
    withinLimit: boolean;
    maximumDistance: string;
    furthestPointIndex: number;
    value: string | null;
    clusterValue: string | null;
};

export type ItemsInfo = { itemValues: string[] };
export type ColumnsInfo = { columnNames: string[]; columnIndicesOrder: number[] };

export class CompactData {
    public static toCompactDeps = <T>(
        data: string,
        transform: (dep: string) => T,
        sep = ";"
    ) =>
        data
            .split(sep)
            .filter((str) => str.length > 0)
            .map(transform);

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

    public static toCompactMFD = (data: string): MFDCompactType => {
        const [withinLimit, index, furthestPointIndex, maximumDistance] = data.split(";");

        return {
            withinLimit: withinLimit == "1",
            index: Number(index),
            furthestPointIndex: Number(furthestPointIndex),
            maximumDistance: maximumDistance,
            value: null,
            clusterValue: null,
        };
    };

    public static toCompactFD = (data: string): FDCompactType => {
        const dep = data.split(",").map(Number);
        return { lhs: dep.slice(0, dep.length - 1), rhs: dep[dep.length - 1] };
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

    public static toMFD = ({
        withinLimit,
        clusterValue,
        index,
        furthestPointIndex,
        value,
        maximumDistance,
    }: MFDCompactType): Mfd => {
        if (clusterValue == null || value == null) {
            throw new ApolloError("Missing value or clusterValue values");
        }

        return {
            index,
            withinLimit,
            maximumDistance,
            furthestPointIndex,
            value,
            clusterValue,
        };
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

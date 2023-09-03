import { AbstractFilter, ComparatorWithParam, ConditionFunction } from "./AbstractFilter";
import { CFDCompactType, CFDItem, ColumnsInfo, CompactData, Item } from "./CompactData";
import { compareArrays, isIntersects } from "./util";
import { Cfd } from "../../../types/types";
import _ from "lodash";

export class CFDFilter extends AbstractFilter<CFDCompactType, Cfd> {
    protected toDependency: (dep: CFDCompactType) => Cfd;
    private args: [ColumnsInfo];

    public initArgs = async () => {
        this.args = [await AbstractFilter.getColumnsInfo(this.fileID)];
        this.toDependency = (dep) => CompactData.toCFD(dep, ...this.args);
    };

    getCompactDeps = async (data: string): Promise<CFDCompactType[]> => {
        return JSON.parse(data) as CFDCompactType[];
    };

    getConditions = async (): Promise<ConditionFunction<CFDCompactType>[]> => {
        const [{ columnNames }] = this.args;
        const { filterString, mustContainLhsColIndices, mustContainRhsColIndices } =
            this.filter;
        const mustContainIndices: number[] = [];
        const mustContainItems: Item[] = [];

        let isFilterCorrect = true;
        if (filterString) {
            if (filterString.includes("=")) {
                const columnWithPattern = filterString.split("=");
                if (columnWithPattern.length != 2) {
                    isFilterCorrect = false;
                } else {
                    const [colName, pattern] = columnWithPattern;
                    try {
                        columnNames.forEach((name, attribute) => {
                            name.match(new RegExp(colName, "i")) &&
                                mustContainItems.push({
                                    attribute,
                                    value: pattern,
                                });
                        });
                    } catch (e) {
                        isFilterCorrect = false;
                    }
                }
            } else {
                try {
                    columnNames.forEach(
                        (name, id) =>
                            name.match(new RegExp(filterString, "i")) &&
                            mustContainIndices.push(id)
                    );
                } catch (e) {
                    isFilterCorrect = false;
                }
            }
            if (mustContainItems.length === 0 && mustContainIndices.length === 0) {
                isFilterCorrect = false;
            }
        }
        const indices = (lhs: CFDItem[]) => lhs.map(({ attribute }) => attribute);

        return [
            () => isFilterCorrect,
            ({ rhs }) =>
                mustContainRhsColIndices == null ||
                mustContainRhsColIndices.length === 0 ||
                !!~_.sortedIndexOf(mustContainRhsColIndices, rhs.attribute),
            ({ lhs }) =>
                mustContainLhsColIndices == null ||
                mustContainLhsColIndices.length === 0 ||
                isIntersects(indices(lhs), mustContainLhsColIndices),
            ({ lhs, rhs }) =>
                mustContainIndices.length === 0 ||
                isIntersects(mustContainIndices, indices(lhs)) ||
                !!~_.sortedIndexOf(mustContainIndices, rhs.attribute),
            ({ lhs, rhs }) =>
                mustContainItems.length === 0 ||
                lhs.some((lhsItem) =>
                    mustContainItems.some((item) => _.isEqual(item, lhsItem))
                ) ||
                mustContainItems.some((item) => _.isEqual(item, rhs)),
        ];
    };

    getComparators = (): ComparatorWithParam<CFDCompactType>[] => {
        const [{ columnIndicesOrder }] = this.args;

        const cfdItemNameComparator = (lhs: CFDItem, rhs: CFDItem) =>
            columnIndicesOrder[lhs.attribute] < columnIndicesOrder[rhs.attribute] ||
            _.isEqual(lhs, rhs);
        const cfdColIdComparator = (lhs: CFDItem, rhs: CFDItem) =>
            lhs.attribute < rhs.attribute || _.isEqual(lhs, rhs);
        const cfdPatternValueComparator = (lhs: CFDItem, rhs: CFDItem) =>
            (lhs.value || "") < (rhs.value || "") || _.isEqual(lhs, rhs);
        return [
            {
                sortBy: "LHS_COL_NAME",
                comparator: (lhs, rhs) =>
                    compareArrays(lhs.lhs, rhs.lhs, cfdItemNameComparator),
            },
            {
                sortBy: "RHS_COL_NAME",
                comparator: (lhs, rhs) => cfdItemNameComparator(lhs.rhs, rhs.rhs),
            },
            {
                sortBy: "LHS_COL_ID",
                comparator: (lhs, rhs) =>
                    compareArrays(lhs.lhs, rhs.lhs, cfdColIdComparator),
            },
            {
                sortBy: "RHS_COL_ID",
                comparator: (lhs, rhs) => cfdColIdComparator(lhs.rhs, rhs.rhs),
            },
            {
                sortBy: "LHS_PATTERN",
                comparator: (lhs, rhs) =>
                    compareArrays(lhs.lhs, rhs.lhs, cfdPatternValueComparator),
            },
            {
                sortBy: "RHS_PATTERN",
                comparator: (lhs, rhs) => cfdPatternValueComparator(lhs.rhs, rhs.rhs),
            },
        ];
    };
}

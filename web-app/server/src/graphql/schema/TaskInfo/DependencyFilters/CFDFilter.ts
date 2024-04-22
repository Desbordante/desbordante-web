import { AbstractFilter, ComparatorWithParam, ConditionFunction } from "./AbstractFilter";
import { CFDCompactType, ColumnsInfo, CompactData, Item, ItemsInfo } from "./CompactData";
import { compareArrays, isIntersects } from "./util";
import { Cfd } from "../../../types/types";
import { FDFilter } from "./FDFilter";
import _ from "lodash";

export class CFDFilter extends AbstractFilter<CFDCompactType, Cfd> {
    protected toDependency: (dep: CFDCompactType) => Cfd;
    protected toCompactDep = CompactData.toCompactCFD;
    private args: [ColumnsInfo, ItemsInfo];

    public initArgs = async () => {
        this.args = [
            await AbstractFilter.getColumnsInfo(this.fileID),
            await AbstractFilter.getItemsInfo(this.state, "CFD"),
        ];
        this.toDependency = (dep) => CompactData.toCFD(dep, ...this.args);
    };

    getConditions = async (): Promise<ConditionFunction<CFDCompactType>[]> => {
        const [{ columnNames }, { itemValues }] = this.args;
        const {
            filterString,
            mustContainLhsColIndices,
            mustContainRhsColIndices,
            withoutKeys,
        } = this.filter;
        const withoutKeyIndices = withoutKeys
            ? await FDFilter.getPKsIndices(this.state, this.type)
            : [];
        const mustContainIndices: number[] = [];
        const mustContainItems: Item[] = [];

        let isFilterCorrect = true;
        if (filterString) {
            if (filterString.includes("=")) {
                const columnWithPattern = filterString.split("=");
                if (columnWithPattern.length != 2) {
                    isFilterCorrect = false;
                }
                const [colName, pattern] = columnWithPattern;
                try {
                    columnNames.forEach((name, id) => {
                        name.match(new RegExp(colName, "i")) &&
                            mustContainItems.push({
                                columnIndex: id,
                                patternIndex: itemValues.indexOf(pattern),
                            });
                    });
                } catch (e) {
                    isFilterCorrect = false;
                }
                if (!itemValues.includes(pattern)) {
                    isFilterCorrect = false;
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
        const indices = (lhs: Item[]) => lhs.map(({ columnIndex }) => columnIndex);

        return [
            () => isFilterCorrect,
            ({ rhs }) =>
                mustContainRhsColIndices == null ||
                mustContainRhsColIndices.length === 0 ||
                !!~_.sortedIndexOf(mustContainRhsColIndices, rhs.columnIndex),
            ({ lhs }) =>
                mustContainLhsColIndices == null ||
                mustContainLhsColIndices.length === 0 ||
                isIntersects(indices(lhs), mustContainLhsColIndices),
            ({ lhs, rhs }) =>
                mustContainIndices.length === 0 ||
                isIntersects(mustContainIndices, indices(lhs)) ||
                !!~_.sortedIndexOf(mustContainIndices, rhs.columnIndex),
            ({ lhs, rhs }) =>
                mustContainItems.length === 0 ||
                lhs.some((lhsItem) =>
                    mustContainItems.some((item) => _.isEqual(item, lhsItem))
                ) ||
                mustContainItems.some((item) => _.isEqual(item, rhs)),
            ({ lhs }) =>
                withoutKeyIndices.length === 0 ||
                !isIntersects(
                    withoutKeyIndices,
                    lhs.map(({ columnIndex }) => columnIndex)
                ),
        ];
    };

    getComparators = (): ComparatorWithParam<CFDCompactType>[] => {
        const [{ columnIndicesOrder }] = this.args;

        const cfdItemNameComparator = (lhs: Item, rhs: Item) =>
            columnIndicesOrder[lhs.columnIndex] < columnIndicesOrder[rhs.columnIndex] ||
            _.isEqual(lhs, rhs);
        const cfdColIdComparator = (lhs: Item, rhs: Item) =>
            lhs.columnIndex < rhs.columnIndex || _.isEqual(lhs, rhs);
        const cfdPatternValueComparator = (lhs: Item, rhs: Item) =>
            lhs.patternIndex < rhs.patternIndex || _.isEqual(lhs, rhs);
        return [
            {
                parameter: "CONF",
                comparator: (lhs, rhs) => lhs.confidence < rhs.confidence,
            },
            { parameter: "SUP", comparator: (lhs, rhs) => lhs.support < rhs.support },
            {
                parameter: "LHS_COL_NAME",
                comparator: (lhs, rhs) =>
                    compareArrays(lhs.lhs, rhs.lhs, cfdItemNameComparator),
            },
            {
                parameter: "RHS_COL_NAME",
                comparator: (lhs, rhs) => cfdItemNameComparator(lhs.rhs, rhs.rhs),
            },
            {
                parameter: "LHS_COL_ID",
                comparator: (lhs, rhs) =>
                    compareArrays(lhs.lhs, rhs.lhs, cfdColIdComparator),
            },
            {
                parameter: "RHS_COL_ID",
                comparator: (lhs, rhs) => cfdColIdComparator(lhs.rhs, rhs.rhs),
            },
            {
                parameter: "LHS_PATTERN",
                comparator: (lhs, rhs) =>
                    compareArrays(lhs.lhs, rhs.lhs, cfdPatternValueComparator),
            },
            {
                parameter: "RHS_PATTERN",
                comparator: (lhs, rhs) => cfdPatternValueComparator(lhs.rhs, rhs.rhs),
            },
        ];
    };
}

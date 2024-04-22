import { AbstractFilter, ComparatorWithParam, ConditionFunction } from "./AbstractFilter";
import { ColumnsInfo, CompactData, FDCompactType } from "./CompactData";
import { compareArrays, isIntersects } from "./util";
import { Fd } from "../../../types/types";
import { MainPrimitiveType } from "../../../../db/models/TaskData/configs/GeneralTaskConfig";
import { TaskState } from "../../../../db/models/TaskData/TaskState";
import _ from "lodash";

export class FDFilter extends AbstractFilter<FDCompactType, Fd> {
    protected toDependency: (dep: FDCompactType) => Fd;
    protected toCompactDep = CompactData.toCompactFD;

    private args: [ColumnsInfo];

    public initArgs = async () => {
        this.args = [await AbstractFilter.getColumnsInfo(this.fileID)];
        this.toDependency = (dep) => CompactData.toFD(dep, ...this.args);
    };

    public static getPKsIndices = async (state: TaskState, type: MainPrimitiveType) => {
        const keysString = await state.getResultFieldAsString(type, "PKColumnIndices");
        return keysString.split(",").map(_.parseInt).filter(_.isInteger).sort();
    };

    getConditions = async (): Promise<ConditionFunction<FDCompactType>[]> => {
        const [{ columnNames }] = this.args;

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
        if (filterString) {
            try {
                columnNames.forEach(
                    (name, id) =>
                        name.match(new RegExp(filterString, "i")) &&
                        mustContainIndices.push(id)
                );
            } catch (e) {
                this.context.logger("Received incorrect filter string");
            }
        }
        return [
            ({ lhs }) =>
                mustContainLhsColIndices == undefined ||
                mustContainLhsColIndices.length === 0 ||
                isIntersects(lhs, mustContainLhsColIndices),
            ({ rhs }) =>
                mustContainRhsColIndices == undefined ||
                (mustContainRhsColIndices.length !== 0 &&
                    !~_.sortedIndexOf(mustContainRhsColIndices, rhs)),
            ({ lhs, rhs }) =>
                !filterString ||
                isIntersects(mustContainIndices, lhs) ||
                !!~_.sortedIndexOf(mustContainIndices, rhs),
            ({ lhs }) =>
                withoutKeyIndices.length === 0 || !isIntersects(withoutKeyIndices, lhs),
        ];
    };

    getComparators = (): ComparatorWithParam<FDCompactType>[] => {
        const [{ columnIndicesOrder }] = this.args;
        const fdColNameComparator = (lhs: number, rhs: number) =>
            columnIndicesOrder[lhs] < columnIndicesOrder[rhs] || _.isEqual(lhs, rhs);
        const fdColIdComparator = (lhs: number, rhs: number) => lhs < rhs;
        return [
            {
                parameter: "LHS_NAME",
                comparator: (lhs, rhs) =>
                    compareArrays(lhs.lhs, rhs.lhs, fdColIdComparator),
            },
            {
                parameter: "RHS_NAME",
                comparator: (lhs, rhs) => fdColIdComparator(lhs.rhs, rhs.rhs),
            },
            {
                parameter: "LHS_COL_ID",
                comparator: (lhs, rhs) =>
                    compareArrays(lhs.lhs, rhs.lhs, fdColNameComparator),
            },
            {
                parameter: "RHS_COL_ID",
                comparator: (lhs, rhs) => fdColNameComparator(lhs.rhs, rhs.rhs),
            },
        ];
    };
}

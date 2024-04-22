import { AbstractFilter, ComparatorWithParam, ConditionFunction } from "./AbstractFilter";
import { CompactData, MFDCompactType } from "./CompactData";
import { ApolloError } from "apollo-server-core";
import { FileInfo } from "../../../../db/models/FileData/FileInfo";
import { MFDTaskConfig } from "../../../../db/models/TaskData/configs/SpecificConfigs";
import { Mfd } from "../../../types/types";
import _ from "lodash";

export class MFDFilter extends AbstractFilter<MFDCompactType, Mfd> {
    protected toDependency: (dep: MFDCompactType) => Mfd;
    protected toCompactDep = CompactData.toCompactMFD;

    protected getSeparator = (): string => {
        return "\n";
    };

    protected prepareRawData = (data: string): string => {
        if (this.filter.MFDClusterIndex == null) {
            throw new Error("Unreachable code");
        }

        return data.split("\n\n")[this.filter.MFDClusterIndex];
    };

    protected applyTransformation = async (
        deps: MFDCompactType[]
    ): Promise<MFDCompactType[]> => {
        if (deps.length == 0) {
            return [];
        }
        const fileInfo = await FileInfo.findByPk(this.fileID);
        if (!fileInfo) {
            throw new ApolloError("Cannot find file");
        }

        const taskConfig = await MFDTaskConfig.findByPk(this.state.taskID);
        if (!taskConfig) {
            throw new ApolloError("Cannot find MFD task config");
        }

        const rows = await FileInfo.GetRowsByIndices(
            fileInfo,
            deps.map((dep) => dep.index)
        );

        const firstRow = await FileInfo.GetRowsByIndices(fileInfo, [deps[0].index]);

        const firstRowData = firstRow.get(deps[0].index);
        if (firstRowData == null) {
            throw new ApolloError("Could not obtain first row");
        }
        const clusterValue = this.rowProjectionToString(
            firstRowData,
            taskConfig.lhsIndices
        );

        for (let i = 0; i < deps.length; i++) {
            const rowData = rows.get(deps[i].index);
            if (rowData == null) {
                throw new ApolloError("Could not obtain row with index ${deps[i].index}");
            }

            deps[i].clusterValue = clusterValue;
            deps[i].value = this.rowProjectionToString(rowData, taskConfig.rhsIndices);
        }

        return deps;
    };

    public initArgs = async () => {
        this.toDependency = CompactData.toMFD;
    };

    private rowProjectionToString = (row: string[], indices: number[]): string => {
        return row.filter((_, index) => indices.includes(index)).join(", ");
    };

    getConditions = async (): Promise<ConditionFunction<MFDCompactType>[]> => {
        let isFilterCorrect = true;
        let providedIndex = 0;

        // NOTE: ATM we only need filter feature to be able to find MFD instance by index.
        if (this.filter.filterString) {
            isFilterCorrect = this.filter.filterString.includes("=");
            if (isFilterCorrect) {
                const predicate = this.filter.filterString.split("=");
                isFilterCorrect = predicate.length == 2 && predicate[0] == "index";
                if (isFilterCorrect) {
                    providedIndex = Number(predicate[1]);
                }
            }
        }

        return [
            () => isFilterCorrect,
            ({ index }) => !this.filter.filterString || _.isEqual(index, providedIndex),
        ];
    };

    getComparators = (): ComparatorWithParam<MFDCompactType>[] => {
        return [
            {
                parameter: "POINT_INDEX",
                comparator: (lhs, rhs) => lhs.index < rhs.index,
            },
            {
                parameter: "FURTHEST_POINT_INDEX",
                comparator: (lhs, rhs) => lhs.furthestPointIndex < rhs.furthestPointIndex,
            },
            {
                parameter: "MAXIMUM_DISTANCE",
                comparator: (lhs, rhs) => lhs.maximumDistance < rhs.maximumDistance,
            },
        ];
    };
}

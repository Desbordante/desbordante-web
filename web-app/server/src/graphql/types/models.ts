import {
    GeneralTaskConfig,
    MainPrimitiveType,
    PrimitiveType,
    SpecificPrimitiveType,
} from "../../db/models/TaskData/configs/GeneralTaskConfig";
import { ResourceLimitErrorType, TaskErrorStatusType } from "./types";
import { $GetType } from "sequelize-typescript/dist/model/model/model";
import { AbstractFilter } from "../schema/TaskInfo/DependencyFilters/AbstractFilter";
import { AlgorithmsConfigType } from "../schema/AppConfiguration/resolvers";
import { FileFormat } from "../../db/models/FileData/FileFormat";
import { FileInfo } from "../../db/models/FileData/FileInfo";
import { Role } from "../../db/models/UserData/Role";
import { Session } from "../../db/models/UserData/Session";
import { TaskState } from "../../db/models/TaskData/TaskState";
import { User } from "../../db/models/UserData/User";

type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type AbstractTaskInfoModel = NonFunctionProperties<GeneralTaskConfig> & {
    prefix: PrimitiveType;
};
export type TaskInfoModel = NonFunctionProperties<GeneralTaskConfig> & {
    prefix: MainPrimitiveType;
};
export type SpecificTaskInfoModel = PartialBy<
    NonFunctionProperties<GeneralTaskConfig>,
    "fileID"
> & { prefix: SpecificPrimitiveType };

export type AbstractTaskDataModel = TaskInfoModel;
export type SpecificTaskDataModel = SpecificTaskInfoModel;
export type TaskStateAnswerModel = TaskState;
export type TaskStateModel = TaskState;
export type InternalServerTaskErrorModel = {
    errorMsg: string;
    status: TaskErrorStatusType;
};
export type ResourceLimitTaskErrorModel = {
    errorMsg: ResourceLimitErrorType;
    status: TaskErrorStatusType;
};
export type CFDPieChartDataModel = CFDTaskResultModel;
export type FDPieChartDataModel = FDTaskResultModel;
export type SessionModel = Session;
export type UserModel = User;
export type RoleModel = Role;
export type PrimitiveTaskConfigModel = {
    fileID: string;
    prefix: PrimitiveType;
} & NonFunctionProperties<$GetType<TaskState[`${PrimitiveType}Config`]>>;
export type AlgorithmsConfigModel = AlgorithmsConfigType;
export type BaseTaskConfigModel = GeneralTaskConfig;
export type TypoClusterTaskConfigModel = { typoFD: string; fileID: string };
export type ARTaskConfigModel = { fileID: string };
export type DatasetInfoModel = FileInfo;
export type InputFileFormatModel = FileFormat;
export type PrimitiveTaskResultModel = { state: TaskState } & TaskInfoModel;
export type SpecificTaskResultModel = {
    state: TaskState;
} & SpecificTaskInfoModel;

type InfoForSpecificCluster = {
    squashed: "true";
    clusterID: number;
    state: TaskState;
};

export type SpecificClusterOrStateModel =
    | { state: TaskState }
    | { errorMsg: string }
    | ({ clusterID: number; rows: Map<number, string[]> } & {
          clusterInfo:
              | {
                    squashed: "false";
                    suspiciousIndices: Set<number>;
                    rowIndices: number[];
                }
              | {
                    squashed: "true";
                    rowIndicesWithAmount: {
                        rowIndex: number;
                        amount: number;
                    }[];
                };
      });
export type ClusterModel = {
    clusterID: number;
    rows: Map<number, string[]>;
} & {
    clusterInfo: {
        squashed: "false";
        suspiciousIndices: Set<number>;
        rowIndices: number[];
    };
};
export type SquashedClusterModel = {
    clusterID: number;
    rows: Map<number, string[]>;
    rowIndices: number[];
} & {
    clusterInfo: {
        squashed: "true";
        rowIndicesWithAmount: { rowIndex: number; amount: number }[];
    };
};
export type ClusterBaseModel = {
    clusterID: number;
    rows: Map<number, string[]>;
} & {
    clusterInfo:
        | {
              squashed: "false";
              suspiciousIndices: Set<number>;
              rowIndices: number[];
          }
        | {
              squashed: "true";
              rowIndicesWithAmount: { rowIndex: number; amount: number }[];
          };
};
export type FDTaskResultModel = PrimitiveTaskResultModel;
export type TypoFDTaskResultModel = PrimitiveTaskResultModel;
export type CFDTaskResultModel = PrimitiveTaskResultModel;
export type ARTaskResultModel = PrimitiveTaskResultModel;
export type SnippetModel = FileInfo;
export type TypoClusterTaskResultModel = PrimitiveTaskResultModel;
export type SpecificTypoClusterTaskResultModel = PrimitiveTaskResultModel;
export type FilteredDepsBaseModel = Awaited<
    ReturnType<typeof AbstractFilter.prototype.getFilteredTransformedDeps>
> & { prefix: MainPrimitiveType };
export type PrimitiveTypeModel = PrimitiveType;

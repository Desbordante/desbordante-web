import { ApolloError, UserInputError } from "apollo-server-core";
import {
    BelongsTo,
    Column,
    ForeignKey,
    IsUUID,
    Model,
    Table,
} from "sequelize-typescript";
import { STRING, UUID } from "sequelize";
import { StatsType, TaskState } from "../TaskState";
import { FileInfo } from "../../FileData/FileInfo";
import { getConfigTableOptions } from "../tableOptions";

const ALL_PRIMITIVES = [
    "AR",
    "CFD",
    "FD",
    "TypoFD",
    "TypoCluster",
    "SpecificTypoCluster",
    "Stats",
] as const;

export type DBTaskPrimitiveType = typeof ALL_PRIMITIVES[number];
export type PrimitiveType = Exclude<DBTaskPrimitiveType, "SpecificTypoCluster">;
export type MainPrimitiveType = Exclude<
    DBTaskPrimitiveType,
    "TypoCluster" | "SpecificTypoCluster"
>;
type OtherPrimitiveType = Exclude<DBTaskPrimitiveType, MainPrimitiveType>;
export type SpecificPrimitiveType = Exclude<
    OtherPrimitiveType,
    "SpecificTypoCluster" | StatsType
>;
export const SPECIFIC_TASKS: DBTaskPrimitiveType[] = [
    "TypoCluster",
    "SpecificTypoCluster",
];
export type RealPrimitiveType = Exclude<MainPrimitiveType, "TypoFD" | StatsType>;

export const isMainPrimitiveType = (
    type: DBTaskPrimitiveType
): type is MainPrimitiveType => {
    return !SPECIFIC_TASKS.includes(type);
};
export const isSpecificPrimitiveType = (
    type: DBTaskPrimitiveType
): type is SpecificPrimitiveType => {
    return SPECIFIC_TASKS.includes(type);
};

export const mainPrimitives = ALL_PRIMITIVES.filter(isMainPrimitiveType);

@Table(getConfigTableOptions())
export class GeneralTaskConfig extends Model {
    @IsUUID(4)
    @ForeignKey(() => TaskState)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskState)
    taskState?: TaskState;

    @ForeignKey(() => FileInfo)
    @Column({ type: UUID, allowNull: false })
    fileID!: string;

    @BelongsTo(() => FileInfo)
    file!: FileInfo;

    @Column({ type: STRING, allowNull: false })
    algorithmName!: string;

    @Column({ type: STRING, allowNull: false })
    type!: DBTaskPrimitiveType;

    static getTaskConfig = async (taskID: string) => {
        const config = await GeneralTaskConfig.findByPk(taskID);
        if (!config) {
            throw new UserInputError(`Task with ID = '${taskID}' not found`);
        }
        return config;
    };

    static getFileInfo = async (taskID: string) => {
        const config = await GeneralTaskConfig.getTaskConfig(taskID);
        const file = await config.$get("file");
        if (!file) {
            throw new ApolloError("File not found");
        }
        return file;
    };
}

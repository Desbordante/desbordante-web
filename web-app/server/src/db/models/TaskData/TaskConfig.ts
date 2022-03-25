import { BelongsTo, Column, ForeignKey, IsUUID, Model, Table } from "sequelize-typescript";
import { STRING, UUID } from "sequelize";
import { FileInfo } from "../FileInfo/FileInfo";
import { TaskState } from "./TaskState";
import {
    ARTaskConfig,
    CFDTaskConfig,
    FDTaskConfig,
    IsPropsValidFunctionType, SpecificTypoClusterConfig,
    TypoClusterConfig,
} from "./SpecificTaskConfigs";
import { TypoFDTaskConfig } from "./SpecificTaskConfigs";

const ALL_PRIMITIVES = ["AR", "CFD", "FD", "TypoFD", "TypoCluster", "SpecificTypoCluster"] as const;
export type PrimitiveType = typeof ALL_PRIMITIVES[number];

@Table({ tableName: "TasksConfig", updatedAt: false, paranoid: true })
export class BaseTaskConfig extends Model {
    @IsUUID(4)
    @ForeignKey(() => TaskState)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskState)
    taskState?: TaskState;

    @ForeignKey(() => FileInfo)
    @Column({ type: UUID, allowNull: true })
    fileID!: string;

    @BelongsTo(() => FileInfo)
    file!: FileInfo;

    @Column({ type: STRING, allowNull: true })
    algorithmName!: string;

    @Column({ type: STRING, allowNull: false })
    type!: PrimitiveType;

    static isPropsValid: IsPropsValidFunctionType = async (props) => {
        switch (props.type) {
            case "FD":
                return FDTaskConfig.isPropsValid(props);
            case "CFD":
                return CFDTaskConfig.isPropsValid(props);
            case "AR":
                return ARTaskConfig.isPropsValid(props);
            case "TypoFD":
                return TypoFDTaskConfig.isPropsValid(props);
            case "TypoCluster":
                return TypoClusterConfig.isPropsValid(props);
            case "SpecificTypoCluster":
                return SpecificTypoClusterConfig.isPropsValid(props);
            default:
                return { errorMessage: `Incorrect primitive type ${props.type}`, isValid: false };
        }
    };
}

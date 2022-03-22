import { BelongsTo, Column, ForeignKey, IsUUID, Model, Table } from "sequelize-typescript";
import { STRING, UUID } from "sequelize";
import { FileInfo } from "../FileInfo/FileInfo";
import { TaskInfo } from "./TaskInfo";
import { ARTaskConfig, CFDTaskConfig, FDTaskConfig, IsPropsValidFunctionType } from "./TaskConfigurations";

const ALL_PRIMITIVES = ["AR", "CFD", "FD"] as const;
export type PrimitiveType = typeof ALL_PRIMITIVES[number];

@Table({
    tableName: "TasksConfig",
    updatedAt: false,
    paranoid: true,
})
export class BaseTaskConfig extends Model {
    @IsUUID(4)
    @ForeignKey(() => TaskInfo)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskInfo)
    taskState?: TaskInfo;

    @ForeignKey(() => FileInfo)
    fileID!: string;

    @BelongsTo(() => FileInfo)
    file!: FileInfo;

    @Column({ type: STRING, allowNull: false })
    algorithmName!: string;

    @Column({ type: STRING, allowNull: false })
    type!: PrimitiveType;

    static isPropsValid: IsPropsValidFunctionType = props => {
        switch (props.type) {
            case "FD":
                return FDTaskConfig.isPropsValid(props);
            case "CFD":
                return CFDTaskConfig.isPropsValid(props);
            case "AR":
                return ARTaskConfig.isPropsValid(props);
            default:
                return { errorMessage: `Incorrect primitive type ${props.type}`, isValid: false };
        }
    };
}

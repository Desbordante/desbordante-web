import { DataTypes, STRING, UUID } from "sequelize";
import { AllowNull, BelongsTo, Column, ForeignKey, IsUUID, Model, PrimaryKey, Table } from "sequelize-typescript";
import { TaskInfo } from "./TaskInfo";

export interface TaskConfigAttributes extends Model {
    algorithmName: string;
    fileID: string;
    type: string;
}

@Table({
    tableName: "TasksConfig",
    updatedAt: false,
})
export class TaskConfig extends Model<TaskConfigAttributes> {

    @PrimaryKey
    @IsUUID(4)
    @ForeignKey(() => TaskInfo)
    @Column(UUID)
    taskID!: string;

    @AllowNull(false)
    @Column(STRING)
    algorithmName!: string;

    @AllowNull(false)
    @Column(STRING)
    type!: string;

    // @BelongsTo(() => TaskInfo)
    // info?: TaskInfo;
}

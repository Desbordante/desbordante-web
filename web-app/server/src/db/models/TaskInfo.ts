import { ApolloError, UserInputError } from "apollo-server-core";
import { BOOLEAN, FLOAT, INTEGER, STRING, UUID, UUIDV4 } from "sequelize";
import { BelongsTo, Column, ForeignKey, HasOne, IsUUID, Model, Table } from "sequelize-typescript";
import { IntersectionTaskProps } from "../../graphql/types/types";
import sendEvent from "../../producer/sendEvent";
import { BaseTaskConfig } from "./BaseTaskConfig";
import { CFDTaskConfig, FDTaskConfig } from "./TaskConfigurations";
import { CFDTaskResult, FDTaskResult } from "./TaskResults";
import { User } from "./User";

@Table({
    tableName: "TasksInfo",
    updatedAt: false,
    paranoid: true,
})
export class TaskInfo extends Model {
    @IsUUID(4)
    @Column({ type: UUID, defaultValue: UUIDV4, primaryKey: true })
    taskID!: string;

    @ForeignKey(() => User)
    userID?: string;

    @BelongsTo(() => User)
    user!: User;

    @Column({ type: BOOLEAN, defaultValue: false, allowNull: false })
    isPrivate!: boolean;

    @Column({ type: INTEGER, defaultValue: 0, allowNull: false })
    attemptNumber!: number;

    @Column({ type: STRING, allowNull: false })
    status!: string;

    @Column({ type: STRING })
    phaseName!: string;

    @Column({ type: INTEGER })
    currentPhase?: number;

    @Column({ type: FLOAT, defaultValue: 0, allowNull: false })
    progress!: number;

    @Column({ type: INTEGER })
    maxPhase?: number;

    @Column({ type: STRING })
    errorMsg?: string;

    @Column({ type: BOOLEAN, defaultValue: false, allowNull: false })
    isExecuted!: boolean;

    @Column({ type: FLOAT })
    elapsedTime?: number;

    @HasOne(() => BaseTaskConfig)
    baseConfig?: BaseTaskConfig;

    ///

    @HasOne(() => FDTaskConfig)
    FDConfig?: FDTaskConfig;

    @HasOne(() => CFDTaskConfig)
    CFDConfig?: CFDTaskConfig;

    ///

    @HasOne(() => FDTaskResult)
    FDResult?: FDTaskResult;

    @HasOne(() => CFDTaskResult)
    CFDResult?: CFDTaskResult;

    ///
    static saveToDB = async (props: IntersectionTaskProps, fileID: string) => {
        const { type: propertyPrefix } = props;
        const taskInfo = await TaskInfo.create({ status: "ADDING TO DB" });
        await taskInfo.$create("baseConfig", { ...props, fileID });
        await taskInfo.$create(propertyPrefix + "Config", { ...props });
        await taskInfo.$create(propertyPrefix + "Result", {});
        return taskInfo;
    };

    static saveToDBIfPropsValid = async (props: IntersectionTaskProps, fileID: string) => {
        const { type } = props;
        let isValid: boolean;
        switch (type) {
            case "FD":
                isValid = FDTaskConfig.isPropsValid(props);
                break;
            case "CFD":
                isValid = CFDTaskConfig.isPropsValid(props);
                break;
            case "AR":
                throw new ApolloError("Not implemented yet");
            default:
                throw new UserInputError("Passed incorrect type", { type });
        }
        if (isValid) {
            return await TaskInfo.saveToDB(props, fileID);
        } else {
            throw new UserInputError("Invalid user input", { ...props });
        }
    };

    static saveTaskToDBAndSendEvent = async (props: IntersectionTaskProps, fileID: string, topicName: string) => {
        const taskInfo = await TaskInfo.saveToDBIfPropsValid(props, fileID);
        await sendEvent(topicName, taskInfo.taskID);
        await taskInfo.update({ status: "ADDED TO THE TASK QUEUE" });
        return taskInfo;
    };
}

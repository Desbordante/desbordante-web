import { ApolloError, UserInputError } from "apollo-server-core";
import { BOOLEAN, FLOAT, INTEGER, STRING, TEXT, UUID, UUIDV4 } from "sequelize";
import { BelongsTo, Column, ForeignKey, HasOne, IsUUID, Model, Table } from "sequelize-typescript";
import { IntersectionTaskProps } from "../../../graphql/types/types";
import sendEvent from "../../../producer/sendEvent";
import { BaseTaskConfig, PrimitiveType } from "./BaseTaskConfig";
import { ARTaskConfig, CFDTaskConfig, FDTaskConfig } from "./TaskConfigurations";
import { ARTaskResult, CFDTaskResult, FDTaskResult } from "./TaskResults";
import { User } from "../UserInfo/User";

const ALL_TASK_STATUSES = ["IN_PROCESS", "COMPLETED", "INTERNAL_SERVER_ERROR", "RESOURCE_LIMIT_IS_REACHED", "ADDED_TO_THE_TASK_QUEUE", "ADDING_TO_DB"] as const;
export type TaskStatusType = typeof ALL_TASK_STATUSES[number];

interface TaskInfoModelMethods {
    fullDestroy: (paranoid: boolean) => Promise<void>;
    getSingleResultFieldAsString: (propertyPrefix: PrimitiveType, attribute: string) => Promise<string>;
}

@Table({
    tableName: "TasksInfo",
    updatedAt: false,
    paranoid: true,
})
export class TaskInfo extends Model implements TaskInfoModelMethods {
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
    status!: TaskStatusType;

    @Column({ type: STRING })
    phaseName!: string;

    @Column({ type: INTEGER })
    currentPhase?: number;

    @Column({ type: FLOAT, defaultValue: 0, allowNull: false })
    progress!: number;

    @Column({ type: INTEGER })
    maxPhase?: number;

    @Column({ type: TEXT })
    errorMsg?: string;

    @Column({ type: BOOLEAN, defaultValue: false, allowNull: false })
    isExecuted!: boolean;

    @Column({ type: FLOAT })
    elapsedTime?: number;

    @HasOne(() => BaseTaskConfig)
    baseConfig!: BaseTaskConfig;

    ///

    @HasOne(() => FDTaskConfig)
    FDConfig?: FDTaskConfig;

    @HasOne(() => CFDTaskConfig)
    CFDConfig?: CFDTaskConfig;

    @HasOne(() => ARTaskConfig)
    ARConfig?: ARTaskConfig;

    ///

    @HasOne(() => FDTaskResult)
    FDResult?: FDTaskResult;

    @HasOne(() => CFDTaskResult)
    CFDResult?: CFDTaskResult;

    @HasOne(() => ARTaskResult)
    ARResult?: ARTaskResult;

    ///

    fullDestroy = async (force = false) => {
        if (force) {
            await this.destroy({ force });
        } else {
            const baseConfig = await this.$get("baseConfig");
            if (!baseConfig) {
                throw new ApolloError(`Task config not found ${this.taskID}`);
            }
            const { type: propertyPrefix } = baseConfig;
            const config = await this.$get(`${propertyPrefix}Config`);
            if (!config) {
                throw new ApolloError(`${propertyPrefix}Config not found`);
            }
            await config.destroy();
            const result = await this.$get(`${propertyPrefix}Result`);
            if (!result) {
                throw new ApolloError(`${propertyPrefix}Result not found`);
            }
            await result.destroy();
        }
    };

    getSingleResultFieldAsString = async (propertyPrefix: PrimitiveType, attribute: string) => {
        const result = await this.$get(`${propertyPrefix}Result`,
            { attributes: [[attribute,"value"]], raw: true }) as unknown as { value: string };
        if (!result) {
            throw new ApolloError(`Not found result for ${this.taskID}, primitiveType = ${propertyPrefix}`);
        }
        return result.value;
    };

    static saveToDB = async (props: IntersectionTaskProps,
                             fileID: string, userID: string | null) => {
        const { type: propertyPrefix } = props;
        const status: TaskStatusType = "ADDING_TO_DB";
        const taskInfo = await TaskInfo.create({ status, userID });
        await taskInfo.$create("baseConfig", { ...props, fileID });
        await taskInfo.$create(`${propertyPrefix}Config`, { ...props });
        await taskInfo.$create(`${propertyPrefix}Result`, {});
        return taskInfo;
    };

    static saveToDBIfPropsValid = async (props: IntersectionTaskProps,
                                         fileID: string, userID: string | null) => {
        const validityAnswer = BaseTaskConfig.isPropsValid(props);
        if (validityAnswer.isValid) {
            return await TaskInfo.saveToDB(props, fileID, userID);
        }
        throw new UserInputError(validityAnswer.errorMessage);
    };

    static saveTaskToDBAndSendEvent = async (props: IntersectionTaskProps, fileID: string,
                                             topicName: string, userID: string | null) => {
        const taskInfo = await TaskInfo.saveToDBIfPropsValid(props, fileID, userID);
        await sendEvent(topicName, taskInfo.taskID);
        const status: TaskStatusType = "ADDED_TO_THE_TASK_QUEUE";
        await taskInfo.update({ status });
        return taskInfo;
    };

    static isTaskExecuted = async (taskID: string) => {
        const taskInfo = await TaskInfo.findByPk(taskID, { attributes: ["isExecuted"] });
        if (!taskInfo) {
            throw new ApolloError("Task not found");
        }
        return taskInfo.isExecuted;
    };
}

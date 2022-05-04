import { ApolloError, UserInputError } from "apollo-server-core";
import { BOOLEAN, FLOAT, INTEGER, STRING, TEXT, UUID, UUIDV4 } from "sequelize";
import { BelongsTo, Column, ForeignKey, HasOne, IsUUID, Model, Table } from "sequelize-typescript";
import { IntersectionTaskProps } from "../../../graphql/types/types";
import sendEvent from "../../../producer/sendEvent";
import { BaseTaskConfig, PrimitiveType } from "./TaskConfig";
import {
    ARTaskConfig,
    CFDTaskConfig,
    FDTaskConfig,
    SpecificTypoClusterConfig,
    TypoClusterConfig,
    TypoFDTaskConfig,
} from "./SpecificTaskConfigs";
import { ARTaskResult, CFDTaskResult, FDTaskResult, SpecificTypoClusterResult, TypoClusterResult, TypoFDTaskResult } from "./SpecificTaskResults";
import { User } from "../UserInfo/User";
import { FileInfo } from "../FileInfo/FileInfo";
import _ from "lodash";

const ALL_TASK_STATUSES = ["IN_PROCESS", "COMPLETED", "INTERNAL_SERVER_ERROR",
    "RESOURCE_LIMIT_IS_REACHED", "ADDED_TO_THE_TASK_QUEUE", "ADDING_TO_DB"] as const;
export type TaskStatusType = typeof ALL_TASK_STATUSES[number];

interface TaskInfoModelMethods {
    fullDestroy: (paranoid: boolean) => Promise<void>;
    getSingleResultFieldAsString: (propertyPrefix: PrimitiveType, attribute: string) => Promise<string>;
}

@Table({ tableName: "TasksState", updatedAt: false, paranoid: true })
export class TaskState extends Model implements TaskInfoModelMethods {
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

    @HasOne(() => ARTaskConfig)
    ARConfig?: ARTaskConfig;

    @HasOne(() => CFDTaskConfig)
    CFDConfig?: CFDTaskConfig;

    @HasOne(() => FDTaskConfig)
    FDConfig?: FDTaskConfig;

    @HasOne(() => TypoFDTaskConfig)
    TypoFDConfig?: TypoFDTaskConfig;

    @HasOne(() => TypoClusterConfig)
    TypoClusterConfig?: TypoClusterConfig;

    @HasOne(() => SpecificTypoClusterConfig)
    SpecificTypoClusterConfig?: SpecificTypoClusterConfig;

    ///

    @HasOne(() => ARTaskResult)
    ARResult?: ARTaskResult;

    @HasOne(() => CFDTaskResult)
    CFDResult?: CFDTaskResult;

    @HasOne(() => FDTaskResult)
    FDResult?: FDTaskResult;

    @HasOne(() => TypoFDTaskResult)
    TypoFDResult?: TypoFDTaskResult;

    @HasOne(() => TypoClusterResult)
    TypoClusterResult?: TypoClusterResult;

    @HasOne(() => SpecificTypoClusterResult)
    SpecificTypoClusterResult?: SpecificTypoClusterResult;

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

    getMultipleResultFieldAsString = async (propertyPrefix: PrimitiveType, attributes: string[]) => {
        const result = await this.$get(`${propertyPrefix}Result`,
            { attributes: attributes.map((value, id) => [value, `value_${id}`]), raw: true }) as any;
        if (!result) {
            throw new ApolloError(`Not found result for ${this.taskID}, primitiveType = ${propertyPrefix}`);
        }
        const answer = new Array<string>();
        for (const id in attributes) {
            answer.push(result[`value_${id}`]);
        }
        return answer;
    };

    getSingleConfigFieldAsString = async (propertyPrefix: PrimitiveType, attribute: string) => {
        const result = await this.$get(`${propertyPrefix}Config`,
            { attributes: [[attribute,"value"]], raw: true }) as unknown as { value: string };
        if (!result) {
            throw new ApolloError(`Not found config value for ${this.taskID}, primitiveType = ${propertyPrefix}`);
        }
        return result.value;
    };

    getMultipleConfigFieldAsString = async (propertyPrefix: PrimitiveType, attributes: string[]) => {
        const result = await this.$get(`${propertyPrefix}Config`,
            { attributes: attributes.map((value, id) => [value, `value_${id}`]), raw: true }) as any;
        if (!result) {
            throw new ApolloError(`Not found config for ${this.taskID}, primitiveType = ${propertyPrefix}`);
        }
        const answer = new Array<string>();
        for (const id in attributes) {
            answer.push(result[`value_${id}`]);
        }
        return answer;
    };

    static transformProps = (props: IntersectionTaskProps) : Omit<IntersectionTaskProps, "typoFD"> & { typoFD?: string } => {
        let typoFD: string | undefined = undefined;
        if (props.typoFD != undefined) {
            typoFD = props.typoFD.join(",");
        }
        return { ...props, typoFD };
    };

    static saveToDB = async (props: IntersectionTaskProps,
                             userID: string | null, fileID: string | null) => {
        const preparedProps = TaskState.transformProps(props);
        const { type: propertyPrefix } = preparedProps;
        const status: TaskStatusType = "ADDING_TO_DB";
        const taskInfo = await TaskState.create({ status, userID });
        await taskInfo.$create("baseConfig", { ...preparedProps, fileID });
        await taskInfo.$create(`${propertyPrefix}Config`, { ...preparedProps });
        await taskInfo.$create(`${propertyPrefix}Result`, {});
        return taskInfo;
    };

    static saveToDBIfPropsValid = async (props: IntersectionTaskProps,
                                         userID: string | null, file: FileInfo) => {
        const validityAnswer = await BaseTaskConfig.isPropsValid(props);

        if (validityAnswer.isValid) {
            const rowsCount = file.rowsCount - Number(file.hasHeader);
            if (props.type == "CFD" && (!_.isNumber(props.minSupportCFD) ||  props.minSupportCFD > rowsCount)) {
                throw new UserInputError(`Min support must be less than or equal to the number of table rows ${rowsCount}`);
            }
            return await TaskState.saveToDB(props, userID, file.fileID);
        }
        throw new UserInputError(validityAnswer.errorMessage);
    };

    static saveTaskToDBAndSendEvent = async (props: IntersectionTaskProps, topicName: string,
                                             userID: string | null, file: FileInfo) => {
        const taskInfo = await TaskState.saveToDBIfPropsValid(props, userID, file);
        await sendEvent(topicName, taskInfo.taskID);
        const status: TaskStatusType = "ADDED_TO_THE_TASK_QUEUE";
        await taskInfo.update({ status });
        return taskInfo;
    };

    static findTaskOrAddToDBAndSendEvent = async (props: IntersectionTaskProps, topicName: string,
                                                  userID: string | null, fileID: string | null = null) => {
        const validityAnswer = await BaseTaskConfig.isPropsValid(props);
        if (!validityAnswer.isValid) {
            throw new UserInputError(validityAnswer.errorMessage);
        }
        const { type } = props;

        if (type === "TypoCluster") {
            const { typoFD, typoTaskID } = props;
            if (typoFD == undefined || typoTaskID == undefined) {
                throw new UserInputError("Received undefined typoFD or typoTaskID");
            }
            const config = await TypoClusterConfig.findOne({ where: { typoFD: typoFD.join(","), typoTaskID } });
            if (!config) {
                const taskInfo = await TaskState.saveToDB(props, userID, fileID);
                await sendEvent(topicName, taskInfo.taskID);
                const status: TaskStatusType = "ADDED_TO_THE_TASK_QUEUE";
                await taskInfo.update({ status });
                return taskInfo;
            } else {
                return config;
            }
        } else if (type === "SpecificTypoCluster") {
            const { typoClusterTaskID, clusterID } = props;
            const config = await SpecificTypoClusterConfig.findOne({ where: { typoClusterTaskID, clusterID } });
            if (!config) {
                const taskInfo = await TaskState.saveToDB(props, userID, fileID);
                await sendEvent(topicName, taskInfo.taskID);
                const status: TaskStatusType = "ADDED_TO_THE_TASK_QUEUE";
                await taskInfo.update({ status });
                return taskInfo;
            } else {
                return config;
            }
        }
        throw new UserInputError("Received incorrect type");
    };

    static isTaskExecuted = async (taskID: string) => {
        const taskInfo = await TaskState.findByPk(taskID, { attributes: ["isExecuted"] });
        if (!taskInfo) {
            throw new ApolloError("Task not found");
        }
        return taskInfo.isExecuted;
    };
}

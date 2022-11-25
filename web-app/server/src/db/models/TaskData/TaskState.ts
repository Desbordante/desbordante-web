import {
    ARTaskConfig,
    CFDTaskConfig,
    FDTaskConfig,
    SpecificTypoClusterTaskConfig,
    StatsTaskConfig,
    TypoClusterTaskConfig,
    TypoFDTaskConfig,
} from "./configs/SpecificConfigs";
import {
    ARTaskResult,
    CFDTaskResult,
    FDTaskResult,
    TypoFDTaskResult,
} from "./results/TasksWithDeps";
import { BOOLEAN, FLOAT, INTEGER, STRING, TEXT, UUID, UUIDV4 } from "sequelize";
import {
    BelongsTo,
    Column,
    ForeignKey,
    HasOne,
    IsUUID,
    Model,
    Table,
} from "sequelize-typescript";
import {
    DBTaskPrimitiveType,
    GeneralTaskConfig,
    PrimitiveType,
} from "./configs/GeneralTaskConfig";
import {
    SpecificTypoClusterResult,
    StatsResult,
    TypoClusterResult,
} from "./results/SubTasks";
import { GraphQLError } from "graphql";
import { User } from "../UserData/User";
import _ from "lodash";

const ALL_TASK_STATUSES = [
    "IN_PROCESS",
    "COMPLETED",
    "INTERNAL_SERVER_ERROR",
    "RESOURCE_LIMIT_IS_REACHED",
    "ADDED_TO_THE_TASK_QUEUE",
    "ADDING_TO_DB",
] as const;
export type TaskStatusType = typeof ALL_TASK_STATUSES[number];
export type StatsType = "Stats";

interface TaskInfoModelMethods {
    fullDestroy: (paranoid: boolean) => Promise<void>;
    getResultFieldAsString: (
        propertyPrefix: PrimitiveType,
        attribute: string
    ) => Promise<string>;
    getResultField: (propertyPrefix: PrimitiveType, attribute: string) => Promise<number>;
    getResultFieldsAsString: (
        propertyPrefix: PrimitiveType,
        attributes: string[]
    ) => Promise<string[]>;
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

    @HasOne(() => GeneralTaskConfig)
    baseConfig!: GeneralTaskConfig;

    ///

    @HasOne(() => ARTaskConfig)
    ARConfig?: ARTaskConfig;

    @HasOne(() => CFDTaskConfig)
    CFDConfig?: CFDTaskConfig;

    @HasOne(() => FDTaskConfig)
    FDConfig?: FDTaskConfig;

    @HasOne(() => TypoFDTaskConfig)
    TypoFDConfig?: TypoFDTaskConfig;

    @HasOne(() => TypoClusterTaskConfig)
    TypoClusterConfig?: TypoClusterTaskConfig;

    @HasOne(() => SpecificTypoClusterTaskConfig)
    SpecificTypoClusterConfig?: SpecificTypoClusterTaskConfig;

    @HasOne(() => StatsTaskConfig)
    StatsConfig?: StatsTaskConfig;

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

    @HasOne(() => StatsResult)
    StatsResult?: StatsResult;

    ///

    fullDestroy = async (force = false) => {
        if (force) {
            await this.destroy({ force });
        } else {
            const baseConfig = await this.$get("baseConfig");
            if (!baseConfig) {
                throw new GraphQLError(`Task config not found ${this.taskID}`);
            }
            const { type: propertyPrefix } = baseConfig;
            const config = await this.$get(`${propertyPrefix}Config`);
            if (!config) {
                throw new GraphQLError(`${propertyPrefix}Config not found`);
            }
            await config.destroy();
            const result = await this.$get(`${propertyPrefix}Result`);
            if (!result) {
                throw new GraphQLError(`${propertyPrefix}Result not found`);
            }
            await result.destroy();
        }
    };

    getResultField = async (prefix: PrimitiveType, attribute: string) => {
        const result = (await this.$get(`${prefix}Result`, {
            attributes: [[attribute, "value"]],
            raw: true,
        })) as unknown as { value: string | undefined };
        if (!result) {
            throw new GraphQLError(
                `Not found result field ${attribute} for ${this.taskID}, primitiveType = ${prefix}`
            );
        }
        const value = _.parseInt(result.value || "");
        if (!_.isInteger(value)) {
            throw new GraphQLError(`Result field is not an integer. Parsed = ${value}`);
        }
        return value;
    };

    getResultFieldAsString = async (prefix: DBTaskPrimitiveType, attribute: string) => {
        const result = (await this.$get(`${prefix}Result`, {
            attributes: [[attribute, "value"]],
            raw: true,
        })) as unknown as { value: string | undefined };
        if (!result) {
            throw new GraphQLError(
                `Not found result field ${attribute} for ${this.taskID}, primitiveType = ${prefix}`
            );
        }
        return result.value || "";
    };

    getResultFieldsAsString = async (
        propertyPrefix: DBTaskPrimitiveType,
        attributes: string[]
    ) => {
        const result = (await this.$get(`${propertyPrefix}Result`, {
            attributes: attributes.map((value, id) => [value, `value_${id}`]),
            raw: true,
        })) as unknown as Record<string, never>;
        if (!result) {
            throw new GraphQLError(
                `Not found result fields [${attributes.join(",")}] for ${
                    this.taskID
                }, primitiveType = ${propertyPrefix}`
            );
        }
        const answer = new Array<string>();
        for (const id in attributes) {
            answer.push(result[`value_${id}`]);
        }
        return answer;
    };

    getSingleConfigFieldAsString = async (
        propertyPrefix: PrimitiveType,
        attribute: string
    ) => {
        const result = (await this.$get(`${propertyPrefix}Config`, {
            attributes: [[attribute, "value"]],
            raw: true,
        })) as unknown as { value: string };
        if (!result) {
            throw new GraphQLError(
                `Not found config value for ${this.taskID}, primitiveType = ${propertyPrefix}`
            );
        }
        return result.value;
    };

    getMultipleConfigFieldAsString = async (
        propertyPrefix: PrimitiveType,
        attributes: string[]
    ) => {
        const result = (await this.$get(`${propertyPrefix}Config`, {
            attributes: attributes.map((value, id) => [value, `value_${id}`]),
            raw: true,
        })) as unknown as Record<string, never>;
        if (!result) {
            throw new GraphQLError(
                `Not found config for ${this.taskID}, primitiveType = ${propertyPrefix}`
            );
        }
        const answer = new Array<string>();
        for (const id in attributes) {
            answer.push(result[`value_${id}`]);
        }
        return answer;
    };

    static getTaskState = async (taskID: string) => {
        const state = await TaskState.findByPk(taskID, {
            attributes: ["taskID", "isExecuted"],
        });
        if (!state) {
            throw new GraphQLError(`Task with ID ${taskID} not found`);
        }
        return state;
    };
}

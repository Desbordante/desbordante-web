import { BelongsTo, Column, ForeignKey, IsUUID, Model } from "sequelize-typescript";
import {
    IntersectionMainTaskProps,
    IntersectionSpecificTaskProps,
} from "../../../../graphql/types/types";
import { TaskState } from "../TaskState";
import { UUID } from "sequelize";

export type IsPropsValidType<T = IntersectionMainTaskProps> = (
    props: T
) => Promise<{ isValid: true } | { errorMessage: string; isValid: false }>;

export type isSpecificPropsValidType = IsPropsValidType<IntersectionSpecificTaskProps>;

export class BaseSpecificTaskConfig extends Model {
    @IsUUID(4)
    @ForeignKey(() => TaskState)
    @Column({ type: UUID, primaryKey: true })
    taskID!: string;

    @BelongsTo(() => TaskState)
    taskState!: TaskState;
}

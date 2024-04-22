import { FindOptions } from "sequelize";
import { ForbiddenError } from "apollo-server-core";
import { Resolvers } from "../../types/types";
import { User } from "../../../db/models/UserData/User";
import { aggregationQuery } from "./util";
import { config } from "../../../config";
import { transporter } from "../../../nodemailer";
import { sequelize } from "../../../db/sequelize";
import { TaskStatusType } from "../../../db/models/TaskData/TaskState";
import { Op } from "sequelize";

export const AdminResolvers: Resolvers = {
    Aggregations: {
        users: async (_, { config: { from, to, granularity } }, { models }) => {
            const usersTable = models.User.tableName;
            const taskStateTable = models.TaskState.tableName;
            const sessionsTable = models.Session.tableName;

            return await aggregationQuery({
                from,
                fromDefault: `SELECT MIN("createdAt") FROM "${usersTable}"`,
                to,
                toDefault: "NOW()",
                granularity,
                columns: (start, end) => ({
                    totalUsers: `SELECT COUNT(*) FROM "${usersTable}" WHERE "createdAt" <= ${end}`,
                    newUsers: `SELECT COUNT(*) FROM "${usersTable}" WHERE "createdAt" BETWEEN ${start} AND ${end}`,
                    activeUsers: `SELECT COUNT(distinct "userID") FROM "${taskStateTable}" WHERE "createdAt" BETWEEN ${start} AND ${end}`,
                    logIns: `SELECT COUNT(*) FROM "${sessionsTable}" WHERE "createdAt" BETWEEN ${start} AND ${end}`,
                }),
            });
        },

        tasks: async (_, { config: { from, to, granularity } }, { models }) => {
            const taskStateTable = models.TaskState.tableName;

            return await aggregationQuery({
                from,
                fromDefault: `SELECT MIN("createdAt") FROM "${taskStateTable}"`,
                to,
                toDefault: "NOW()",
                granularity,
                columns: (start, end) => ({
                    totalTasks: `SELECT COUNT(*) FROM "${taskStateTable}" WHERE "createdAt" <= ${end}`,
                    successfullyExecutedNewTasks: `SELECT COUNT(*) FROM "${taskStateTable}" WHERE ("createdAt" BETWEEN ${start} AND ${end}) AND "status" = 'COMPLETED'`,
                    failedNewTasks: `SELECT COUNT(*) FROM "${taskStateTable}" WHERE ("createdAt" BETWEEN ${start} AND ${end}) AND ("status" = 'INTERNAL_SERVER_ERROR' OR "status" = 'RESOURCE_LIMIT_IS_REACHED')`,
                }),
            });
        },

        files: async (_, { config: { from, to, granularity } }, { models }) => {
            const fileInfoTable = models.FileInfo.tableName;

            return await aggregationQuery({
                from,
                fromDefault: `SELECT MIN("createdAt") FROM "${fileInfoTable}"`,
                to,
                toDefault: "NOW()",
                granularity,
                columns: (start, end) => ({
                    totalFiles: `SELECT COUNT(*) FROM "${fileInfoTable}" WHERE "createdAt" <= ${end}`,
                    newFiles: `SELECT COUNT(*) FROM "${fileInfoTable}" WHERE "createdAt" BETWEEN ${start} AND ${end}`,
                    totalSpaceOccupied: `SELECT COALESCE(SUM("fileSize"), 0) FROM "${fileInfoTable}" WHERE "createdAt" <= ${end}`,
                }),
            });
        },
    },

    Statistics: {
        space: async (parent, _, { models }) => {
            const used = await models.FileInfo.sum("fileSize");

            return {
                all: 100,
                used,
            };
        },

        files: async (parent, _, { models }) => {
            const builtIn = await models.FileInfo.count({
                where: {
                    isBuiltIn: true,
                },
            });

            const all = await models.FileInfo.count();

            return {
                all,
                builtIn,
            };
        },

        tasks: async (parent, _, { models }) => {
            const completed = await models.TaskState.count({
                where: {
                    status: "COMPLETED",
                },
            });

            const inProgress = await models.TaskState.count({
                where: {
                    status: "IN_PROCESS",
                },
            });

            const failed = await models.TaskState.count({
                where: {
                    status: {
                        [Op.or]: ["RESOURCE_LIMIT_IS_REACHED", "INTERNAL_SERVER_ERROR"],
                    },
                },
            });

            const queued = await models.TaskState.count({
                where: {
                    status: {
                        [Op.or]: ["ADDED_TO_THE_TASK_QUEUE", "ADDING_TO_DB"],
                    },
                },
            });

            return {
                completed,
                inProgress,
                failed,
                queued,
            };
        },

        users: async (parent, _, { models }) => {
            const active = await models.User.count({
                where: {
                    accountStatus: "EMAIL_VERIFIED",
                },
            });

            const all = await models.User.count();

            return {
                all,
                active,
            };
        },
    },

    Query: {
        aggregations: async (parent, _, { sessionInfo }) => {
            if (!sessionInfo || !sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                throw new ForbiddenError("User don't have permission");
            }

            return {};
        },

        statistics: async (parent, _, { sessionInfo }) => {
            if (!sessionInfo || !sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                throw new ForbiddenError("User don't have permission");
            }

            return {};
        },
    },

    Mutation: {
        sendMessage: async (
            parent,
            { userIDs, messageData },
            { sessionInfo, models }
        ) => {
            if (!sessionInfo || !sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                throw new ForbiddenError("User don't have permission");
            }

            let options: FindOptions<User> = {};

            if (userIDs && userIDs.length > 0) {
                options = {
                    where: {
                        userID: userIDs,
                    },
                };
            }

            const recepients = await models.User.findAll(options);
            const recepientEmails = recepients.map((user) => user.email);

            try {
                const t = await transporter.sendMail({
                    from: `Desbordante Enjoyer <${config.postfix.email}>`,
                    to: recepientEmails,
                    subject: messageData.subject,
                    text: messageData.body,
                });

                const accepted = t.accepted.map((value) =>
                    typeof value === "string" ? value : value.address
                );

                const rejected = t.rejected.map((value) =>
                    typeof value === "string" ? value : value.address
                );

                return {
                    status: "OK",
                    accepted,
                    rejected,
                };
            } catch (error) {
                console.log(error);

                return {
                    status: "ERROR",
                };
            }
        },
    },
};

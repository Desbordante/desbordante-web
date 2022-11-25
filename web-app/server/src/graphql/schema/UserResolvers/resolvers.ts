import { Code, CodeType } from "../../../db/models/UserData/Code";
import {
    GeneralTaskConfig,
    MainPrimitiveType,
} from "../../../db/models/TaskData/configs/GeneralTaskConfig";
import { PermissionType, Resolvers } from "../../types/types";
import {
    RefreshTokenInstance,
    SessionStatusType,
} from "../../../db/models/UserData/Session";
import { AccountStatusType } from "../../../db/models/UserData/User";
import { FindOptions } from "sequelize";
import { GraphQLError } from "graphql";
import { Permission } from "../../../db/models/UserData/Permission";
import { Role } from "../../../db/models/UserData/Role";
import config from "../../../config";
import { createAndSendVerificationCode } from "./emailSender";
import jwt from "jsonwebtoken";

export const UserResolvers: Resolvers = {
    Role: {
        permissions: async ({ permissionIndices }) => {
            const indices = JSON.parse(permissionIndices) as number[];
            return indices.map((id) => Permission.getAllPermissions()[id]);
        },
    },
    Session: {
        user: async ({ userID }, _, { models }) => {
            const user = await models.User.findByPk(userID);
            if (!user) {
                throw new GraphQLError("User not found");
            }
            return user;
        },
    },
    User: {
        permissions: async ({ userID }, _, { models }) => {
            if (!userID) {
                throw new GraphQLError("UserID is undefined");
            }
            const user = await models.User.findByPk(userID);
            if (!user) {
                throw new GraphQLError("User not found");
            }
            return (await user.getPermissions()) as PermissionType[];
        },
        roles: async ({ userID }, _, { models }) => {
            if (!userID) {
                throw new GraphQLError("UserID is undefined");
            }
            return models.Role.findAll({ where: { userID } });
        },
        feedbacks: async ({ userID }, _, { models }) => {
            if (!userID) {
                throw new GraphQLError("UserID is undefined");
            }
            return await models.Feedback.findAll({ where: { userID } });
        },
        tasks: async ({ userID }, _, { models }) => {
            if (!userID) {
                throw new GraphQLError("UserID is undefined");
            }
            const configs = await models.GeneralTaskConfig.findAll({
                where: { userID },
                paranoid: true,
                attributes: ["taskID", "fileID", ["type", "propertyPrefix"]],
            });
            return configs as (GeneralTaskConfig & {
                prefix: MainPrimitiveType;
            })[];
        },
        datasets: async ({ userID }, _, { models }) => {
            if (!userID) {
                throw new GraphQLError("UserID is undefined");
            }
            return await models.FileInfo.findAll({
                where: {
                    userID,
                    isValid: true,
                },
            });
        },
    },
    Feedback: {
        user: async ({ userID }, _, { models }) => {
            if (!userID) {
                throw new GraphQLError("UserID is undefined");
            }
            return await models.User.findByPk(userID);
        },
    },
    ChangePasswordAnswer: {
        __resolveType: (parent) => {
            return parent.__typename || "TokenPair";
        },
    },
    Query: {
        feedbacks: async (parent, args, { models, sessionInfo }) => {
            if (!sessionInfo || !sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                throw new GraphQLError("User must have permission", {
                    extensions: { code: "ForbiddenError" },
                });
            }
            if (args.offset < 0 || args.limit <= 0 || args.limit > 100) {
                throw new GraphQLError("Incorrect offset or limit", {
                    extensions: { code: "UserInputError", args },
                });
            }
            return await models.Feedback.findAll(args);
        },
        getAnonymousPermissions: () => {
            return Role.getPermissionsForRole("ANONYMOUS") as PermissionType[];
        },
        user: async (parent, { userID }, { models, sessionInfo }) => {
            if (!sessionInfo) {
                throw new GraphQLError("User must be authorized", {
                    extensions: { code: "AuthenticationError" },
                });
            }
            if (!userID) {
                userID = sessionInfo.userID;
            }
            if (
                sessionInfo.permissions.includes("VIEW_ADMIN_INFO") ||
                sessionInfo.userID === userID
            ) {
                const user = await models.User.findOne({ where: { userID } });
                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: { code: "UserInputError" },
                    });
                }
                return user;
            }
            throw new GraphQLError("User doesn't have permissions", {
                extensions: { code: "ForbiddenError" },
            });
        },
        users: async (parent, { pagination }, { models, sessionInfo }) => {
            if (!sessionInfo || !sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                throw new GraphQLError("User don't have permission", {
                    extensions: { code: "ForbiddenError" },
                });
            }
            return await models.User.findAll(pagination);
        },
        sessions: async (parent, { pagination, onlyValid }, { models, sessionInfo }) => {
            if (!sessionInfo || !sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                throw new GraphQLError("User don't have permission", {
                    extensions: { code: "ForbiddenError" },
                });
            }
            const { limit, offset } = pagination;
            if (limit < 1 || limit > 100 || offset < 0) {
                throw new GraphQLError("Incorrect limit or offset", {
                    extensions: { code: "UserInputError" },
                });
            }
            let options: FindOptions = { ...pagination };
            if (onlyValid) {
                const status: SessionStatusType = "VALID";
                options = { ...options, where: { status } };
            }
            return await models.Session.findAll(options);
        },
    },
    Mutation: {
        createFeedback: async (parent, args, { models, sessionInfo }) => {
            const userID = sessionInfo ? sessionInfo.userID : null;
            return await models.Feedback.create({ userID, ...args });
        },
        logIn: async (parent, { email, pwdHash }, { models, device, sessionInfo }) => {
            if (sessionInfo) {
                throw new GraphQLError("You are already logged", {
                    extensions: { code: "AuthenticationError" },
                });
            }
            const user = await models.User.findOne({
                where: { email, pwdHash },
            });
            if (!user) {
                throw new GraphQLError("Incorrect login or password", {
                    extensions: { code: "UserInputError" },
                });
            }
            const session = await user.createSession(device.deviceID);
            return await session.issueTokenPair();
        },
        logOut: async (parent, { allSessions }, { models, sessionInfo }) => {
            if (!sessionInfo) {
                throw new GraphQLError("Session information wasn't provided", {
                    extensions: { code: "UserInputError" },
                });
            }
            const status: SessionStatusType = "INVALID";
            const options = allSessions
                ? { where: { userID: sessionInfo.userID } }
                : { where: { sessionID: sessionInfo.sessionID } };
            const [affectedRows] = await models.Session.update({ status }, options);
            if (affectedRows >= 1) {
                return `Successfully updated ${affectedRows} sessions`;
            } else {
                throw new GraphQLError("Session wasn't updated");
            }
        },
        issueVerificationCode: async (
            parent,
            args,
            { models, logger, device, sessionInfo }
        ) => {
            if (!sessionInfo) {
                throw new GraphQLError("User must be logged in", {
                    extensions: { code: "AuthenticationError" },
                });
            }
            const { userID } = sessionInfo;
            const user = await models.User.findByPk(userID);

            if (!user) {
                throw new GraphQLError("Incorrect userID was provided", {
                    extensions: { code: "UserInputError" },
                });
            }
            if (user.accountStatus !== "EMAIL_VERIFICATION") {
                throw new GraphQLError("User has incorrect account status", {
                    extensions: { code: "UserInputError" },
                });
            }
            const type: CodeType = "EMAIL_VERIFICATION";
            const options = { where: { userID, type } };
            const code = await models.Code.findOne(options);
            if (code) {
                await models.Code.destroy(options);
            }
            await createAndSendVerificationCode(
                userID,
                device.deviceID,
                user.email,
                "EMAIL_VERIFICATION",
                logger
            );
            return { message: "Verification code was sent to email" };
        },
        issueCodeForPasswordRecovery: async (
            parent,
            { email },
            { models, sessionInfo, device, logger }
        ) => {
            if (sessionInfo) {
                throw new GraphQLError("User must be logged out", {
                    extensions: { code: "UserInputError" },
                });
            }
            const user = await models.User.findOne({
                where: { email },
                attributes: ["email", "userID"],
            });
            if (!user) {
                throw new GraphQLError(`Email ${email} not found`, {
                    extensions: { code: "UserInputError", email },
                });
            }
            const type: CodeType = "PASSWORD_RECOVERY_PENDING";
            let options = {
                where: { userID: user.userID, type },
            } as FindOptions<Code>;
            let code = await models.Code.findOne(options);
            if (code) {
                await models.Code.destroy(options);
            }
            options = {
                where: {
                    userID: user.userID,
                    type: "PASSWORD_RECOVERY_APPROVED",
                },
            } as FindOptions<Code>;
            code = await models.Code.findOne(options);
            if (code) {
                await models.Code.destroy(options);
            }

            await createAndSendVerificationCode(
                user.userID,
                device.deviceID,
                user.email,
                "PASSWORD_RECOVERY_PENDING",
                logger
            );
            return { message: "Verification code was sent to email" };
        },
        changePassword: async (
            parent,
            { currentPwdHash, newPwdHash, email },
            { device, models, sessionInfo, logger }
        ) => {
            if (!sessionInfo) {
                const { deviceID } = device;
                if (!email) {
                    throw new GraphQLError("Email is undefined", {
                        extensions: { code: "UserInputError", email },
                    });
                }
                const user = await models.User.findOne({
                    where: { email },
                    attributes: ["email", "userID"],
                });
                if (!user) {
                    throw new GraphQLError("Incorrect email was provided", {
                        extensions: { code: "UserInputError", email },
                    });
                }
                const code = await models.Code.findAndDestroyCodeIfNotValid(
                    user.userID,
                    "PASSWORD_RECOVERY_APPROVED",
                    deviceID
                );
                await code.destroy();
                try {
                    await user.update({ pwdHash: newPwdHash });
                    const session = await user.createSession(device.deviceID);
                    return await session.issueTokenPair();
                } catch (e) {
                    throw new GraphQLError("INTERNAL SERVER ERROR");
                }
            } else {
                if (currentPwdHash === null) {
                    throw new GraphQLError("User must send current password", {
                        extensions: { code: "UserInputError", email },
                    });
                }
                const user = await models.User.findByPk(sessionInfo.userID);
                if (!user) {
                    throw new GraphQLError("User not found");
                }
                if (currentPwdHash === newPwdHash) {
                    throw new GraphQLError("New password is equal to current password", {
                        extensions: { code: "UserInputError", email },
                    });
                }

                if (user.pwdHash !== currentPwdHash) {
                    throw new GraphQLError("Incorrect current password", {
                        extensions: { code: "UserInputError", email },
                    });
                }
                try {
                    await user.update({ pwdHash: newPwdHash });
                    return {
                        __typename: "SuccessfulMessage",
                        message: "Password successfully changed",
                    };
                } catch (e) {
                    logger("Error while changing password", e);
                    throw new GraphQLError("Error while changing password");
                }
            }
        },
        createUser: async (
            parent,
            { props },
            { models, logger, sessionInfo, device }
        ) => {
            if (sessionInfo) {
                throw new GraphQLError("User already logged in", {
                    extensions: { code: "AuthenticationError" },
                });
            }
            const user = await models.User.findOne({
                where: { email: props.email },
            });
            if (user) {
                throw new GraphQLError(`Email ${props.email} already used`, {
                    extensions: { code: "UserInputError" },
                });
            }
            const accountStatus: AccountStatusType = "EMAIL_VERIFICATION";
            const newUser = await models.User.create({
                ...props,
                accountStatus,
            });
            await newUser.addRole("ANONYMOUS");

            const session = await newUser.createSession(device.deviceID);

            logger("New account created");
            const tokens = await session.issueTokenPair();
            return { message: "New account created", tokens };
        },
        approveUserEmail: async (
            parent,
            { codeValue },
            { models, device, sessionInfo }
        ) => {
            if (!sessionInfo) {
                throw new GraphQLError("User must be logged in", {
                    extensions: { code: "AuthenticationError" },
                });
            }
            const { userID } = sessionInfo;
            const user = await models.User.findByPk(userID);

            if (!user) {
                throw new GraphQLError("User not found");
            }
            if (user.accountStatus !== "EMAIL_VERIFICATION") {
                throw new GraphQLError("User has incorrect account status", {
                    extensions: { code: "UserInputError" },
                });
            }
            const type: CodeType = "EMAIL_VERIFICATION";
            const code = await models.Code.findAndDestroyCodeIfNotValid(
                userID,
                type,
                device.deviceID,
                codeValue
            );
            await code.destroy();
            const accountStatus: AccountStatusType = "EMAIL_VERIFIED";
            await user.update({ accountStatus });
            await user.addRole("USER");

            const session = await models.Session.findByPk(sessionInfo.sessionID);
            if (!session) {
                throw new GraphQLError("Session not found");
            }
            return session.issueTokenPair();
        },
        approveRecoveryCode: async (
            parent,
            { email, codeValue },
            { models, device, sessionInfo }
        ) => {
            if (sessionInfo) {
                throw new GraphQLError("User must be logged out", {
                    extensions: { code: "UserInputError" },
                });
            }
            const { deviceID } = device;
            const user = await models.User.findOne({ where: { email } });
            if (!user) {
                throw new GraphQLError("Incorrect email was provided", {
                    extensions: { code: "UserInputError" },
                });
            }
            const code = await models.Code.findAndDestroyCodeIfNotValid(
                user.userID,
                "PASSWORD_RECOVERY_PENDING",
                deviceID,
                codeValue
            );
            const type: CodeType = "PASSWORD_RECOVERY_APPROVED";
            try {
                await code.update({ type });
                return { message: "Password successfully changed" };
            } catch (e) {
                throw new GraphQLError("INTERNAL SERVER ERROR");
            }
        },
        refresh: async (parent, { refreshToken }, { models, device }) => {
            let decoded: RefreshTokenInstance;
            try {
                decoded = jwt.verify(
                    refreshToken,
                    config.keys.secretKey
                ) as RefreshTokenInstance;
            } catch (e) {
                throw new GraphQLError("Invalid refresh token was provided", {
                    extensions: { code: "AuthenticationError" },
                });
            }
            const { userID, sessionID, deviceID, iat } = decoded;
            const session = await models.Session.findByPk(sessionID, {
                attributes: [
                    "refreshTokenIat",
                    "status",
                    "deviceID",
                    "userID",
                    "sessionID",
                ],
            });

            if (!session) {
                throw new GraphQLError("Invalid sessionID was provided", {
                    extensions: { code: "AuthenticationError" },
                });
            }
            if (userID != session.userID) {
                throw new GraphQLError("Session have another user", {
                    extensions: { code: "AuthenticationError" },
                });
            }
            if (session.refreshTokenIat !== iat) {
                throw new GraphQLError("Received expired refresh token", {
                    extensions: { code: "AuthenticationError" },
                });
            }
            if (session.status !== "VALID") {
                throw new GraphQLError("Using invalid session", {
                    extensions: { code: "AuthenticationError" },
                });
            }
            if (session.deviceID !== device.deviceID || session.deviceID !== deviceID) {
                throw new GraphQLError("User's device changed", {
                    extensions: { code: "AuthenticationError" },
                });
            }
            return session.issueTokenPair();
        },
    },
};

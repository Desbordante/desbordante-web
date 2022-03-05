import { ApolloError, ForbiddenError, UserInputError } from "apollo-server-core";
import { AuthenticationError } from "apollo-server-express";
import jwt from "jsonwebtoken";
import { FindOptions } from "sequelize";
import { CodeType } from "../../../db/models/Authorization/Code";
import { Permission } from "../../../db/models/Authorization/Permission";
import { Role } from "../../../db/models/Authorization/Role";
import { RefreshTokenInstance, SessionStatusType } from "../../../db/models/Authorization/Session";
import { AccountStatusType } from "../../../db/models/Authorization/User";
import { Resolvers } from "../../types/types";
import { sendVerificationCode } from "./emailSender";

export const UserResolvers : Resolvers = {
    Role: {
        // @ts-ignore
        permissions: async ({ permissionIndices }, _, { models, sessionInfo, logger }) => {
            const indices = JSON.parse(permissionIndices) as number[];
            return indices.map(id => Permission.getAllPermissions()[id]);
        },
    },
    Session: {
        // @ts-ignore
        user: async ({ userID }, _, { models, sessionInfo, logger }) => {
            const user = await models.User.findByPk(userID);
            if (!user) {
                throw new ApolloError("User not found");
            }
            return user;
        },
    },
    User: {
        // @ts-ignore
        permissions: async ({ userID }, _, { models, sessionInfo, logger }) => {
            if (!userID) {
                throw new ApolloError("UserID is undefined");
            }
            const user = await models.User.findByPk(userID);
            if (!user) {
                throw new ApolloError("User not found");
            }
            return await user.getPermissions();
        },
        roles: async ({ userID }, _, { models, sessionInfo, logger }) => {
            if (!userID) {
                throw new ApolloError("UserID is undefined");
            }
            return models.Role.findAll({ where: { userID } });
        },
        // @ts-ignore
        feedbacks: async ({ userID }, _, { models, sessionInfo, logger }) => {
            if (!userID) {
                throw new ApolloError("UserID is undefined");
            }
            return await models.Feedback.findAll({ where: { userID } });
        },
        // @ts-ignore
        tasks: async ({ userID }, _, { models, logger, sessionInfo }) => {
            if (!userID) {
                throw new ApolloError("UserID is undefined");
            }
            return await models.TaskInfo.findAll({ where: { userID } });
        },
        // @ts-ignore
        datasets: async ({ userID }, _, { models, logger }) => {
            if (!userID) {
                throw new ApolloError("UserID is undefined");
            }
            return await models.FileInfo.findAll({ where: { userID } })
                .then(files => files.map(file => ({ fileID: file.ID })));
        },
    },
    Feedback: {
        // @ts-ignore
        user: async ({ userID }, _, { models, logger, sessionInfo }) => {
            if (!userID) {
                return null;
            }
            return await models.User.findByPk(userID);
        },
    },
    Query: {
        // @ts-ignore
        feedbacks: async (parent, args, { models, logger, sessionInfo }) => {
            if (!sessionInfo || !sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                throw new ForbiddenError("User must have permission");
            }
            if (args.offset < 0 || args.limit <= 0 || args.limit > 100 ) {
                throw new UserInputError("Incorrect offset or limit", args);
            }
            return await models.Feedback.findAll(args);
        },
        // @ts-ignore
        getAnonymousPermissions: (parent, obj, { models, logger }) => {
            const permissions = Role.getPermissionsForRole("ANONYMOUS");
            if (!permissions) {
                throw new ApolloError("Permissions for anonymous not found");
            }
            return permissions;
        },
        // @ts-ignore
        user: async(parent, { userID }, { models, logger, sessionInfo }) => {
            if (!sessionInfo) {
                throw new AuthenticationError("User must be authorized");
            }
            if (sessionInfo.permissions.includes("VIEW_ADMIN_INFO") || sessionInfo.userID === userID) {
                const user = await models.User.findOne({ where: { userID } });
                if (!user) {
                    throw new UserInputError("User not found");
                }
                return user;
            }
            throw new ForbiddenError("User doesn't have permissions");
        },
        // @ts-ignore
        users: async (parent, args, { models, logger, sessionInfo }) => {
            if (!sessionInfo || !sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                throw new ForbiddenError("User don't have permission");
            }
            return await models.User.findAll(args);
        },
        // @ts-ignore
        sessions: async (parent, { offset, limit, onlyValid }, { models, logger, sessionInfo }) => {
            if (!sessionInfo || !sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                throw new ForbiddenError("User don't have permission");
            }
            if (limit < 1 || limit > 100 || offset < 0) {
                throw new UserInputError("Incorrect limit or offset");
            }
            let options: FindOptions = { offset, limit };
            if (onlyValid) {
                const status: SessionStatusType = "VALID";
                options = { ...options, where: { status } };
            }
            return await models.Session.findAll(options);
        },
    },
    Mutation: {
        // @ts-ignore
        createFeedback: async (parent, args, { models, logger, sessionInfo }) => {
            const userID = sessionInfo ? sessionInfo.userID : null;
            return await models.Feedback.create({ userID, ...args });
        },
        logIn: async (parent, { email, pwdHash }, { models, logger, device, sessionInfo }) => {
            if (sessionInfo) {
                throw new AuthenticationError("You are already logged");
            }
            const user = await models.User.findOne({ where: { email, pwdHash } });
            if (!user) {
                throw new UserInputError("Incorrect login or password");
            }
            const session = await user.createSession(device.deviceID);
            return await session.issueTokenPair();
        },
        logOut: async (parent, { allSessions }, { models, logger, device, sessionInfo }) => {
            if (!sessionInfo) {
                throw new UserInputError("Session information wasn't provided");
            }
            const status: SessionStatusType = "INVALID";
            const options = allSessions ? { where: { userID: sessionInfo.userID } } : { where: { sessionID: sessionInfo.sessionID } };
            const [affectedRows] = await models.Session.update({ status }, options);
            if (affectedRows >= 1) {
                return `Successfully updated ${affectedRows} sessions`;
            } else {
                throw new ApolloError("Session wasn't updated");
            }
        },
        issueVerificationCode: async (parent, args , { models, logger, device, sessionInfo }) => {
            if (!sessionInfo) {
                throw new AuthenticationError("User must be logged in");
            }
            const { userID } = sessionInfo;
            const user = await models.User.findByPk(userID);

            if (!user) {
                throw new UserInputError("Incorrect userID was provided");
            }
            if (user.accountStatus !== "EMAIL_VERIFICATION") {
                throw new UserInputError("User has incorrect account status");
            }
            const type: CodeType = "EMAIL_VERIFICATION";
            const options = { where: { userID, type } };
            let code = await models.Code.findOne(options);
            if (code) {
                await models.Code.destroy(options);
            }
            code = await models.Code.createEmailVerificationCode(userID, device.deviceID);
            if (process.env.USE_NODEMAILER === "true") {
                try {
                    await sendVerificationCode(code.value, user.email);
                } catch (e) {
                    logger("Problem while sending verification code", e);
                    throw new ApolloError("Incorrect server work");
                }
                logger("Code was sent to email");
            } else {
                logger("Code wasn't sent to email [NODEMAILER DISABLED]");
                logger(`Issue new verification code = ${code.value}`);
            }
            return { message: "Verification code was sent to email" };
        },
        createUser: async (parent, { props }, { models, logger, sessionInfo, device }) => {
            if (sessionInfo) {
                throw new AuthenticationError("User already logged in");
            }
            const user = await models.User.findOne({ where: { email: props.email } });
            if (user) {
                throw new UserInputError(`Email ${props.email} already used`);
            }
            const accountStatus: AccountStatusType = "EMAIL_VERIFICATION";
            const newUser = await models.User.create({ ...props, accountStatus });
            await newUser.addRole("ANONYMOUS");

            const session = await newUser.createSession(device.deviceID);

            logger("New account created");
            const tokens = await session.issueTokenPair();
            return { message: "New account created", tokens };
        },
        approveUserEmail: async (parent, { codeValue }, { models, device, sessionInfo }) => {
            if (!sessionInfo) {
                throw new AuthenticationError("User must be logged in");
            }
            const { userID } = sessionInfo;
            const user = await models.User.findByPk(userID);

            if (!user) {
                throw new ApolloError("User not found");
            }
            if (user.accountStatus !== "EMAIL_VERIFICATION") {
                throw new UserInputError("User has incorrect account status");
            }
            const type: CodeType = "EMAIL_VERIFICATION";
            const code = await models.Code.findOne({ where: { userID, type } });
            if (!code) {
                throw new UserInputError("User hasn't email verification codes");
            }
            if (code.deviceID !== device.deviceID) {
                await code.destroy();
                throw new UserInputError("Request sent from another device, temporary code destroyed");
            }

            if (code.expiringDate < new Date(new Date().toUTCString())) {
                await code.destroy();
                throw new UserInputError("Code was expired");
            }

            if (code.value !== codeValue) {
                await code.destroy();
                throw new UserInputError("Received incorrect code value, temporary code was destroyed");
            } else {
                await code.destroy();
                const accountStatus: AccountStatusType = "EMAIL_VERIFIED";
                await user.update({ accountStatus });
                await user.addRole("USER");

                const session = await models.Session.findByPk(sessionInfo.sessionID);
                if (!session) {
                    throw new ApolloError("Session not found");
                }
                return session.issueTokenPair();
            }
        },
        refresh: async (parent, { refreshToken }, { models, device }) => {
            let decoded: RefreshTokenInstance;
            try {
                decoded = jwt.verify(refreshToken, process.env.SECRET_KEY!) as RefreshTokenInstance;
            } catch (e) {
                throw new AuthenticationError("INVALID REFRESH TOKEN WAS PROVIDED");
            }
            const { userID, sessionID, deviceID, iat } = decoded;
            const session = await models.Session.findByPk(sessionID,
                { attributes: ["refreshTokenIat", "status", "deviceID", "userID", "sessionID"] });

            if (!session) {
                throw new AuthenticationError("Invalid sessionID was provided");
            }
            if (userID != session.userID) {
                throw new AuthenticationError("Session have another user");
            }
            if (session.refreshTokenIat !== iat) {
                throw new AuthenticationError("Received expired refresh token");
            }
            if (session.status !== "VALID") {
                throw new AuthenticationError("Using invalid session");
            }
            if (session.deviceID !== device.deviceID
                || session.deviceID !== deviceID) {
                throw new AuthenticationError("User's device changed");
            }
            return session.issueTokenPair();
        },
    },
};

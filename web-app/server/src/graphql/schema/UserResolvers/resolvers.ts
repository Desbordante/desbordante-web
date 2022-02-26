import { ApolloError, ForbiddenError, UserInputError } from "apollo-server-core";
import { AuthenticationError } from "apollo-server-express";
import jwt from "jsonwebtoken";
import { PermissionEnum, RoleEnum } from "../../../db/models/permissionsConfig";
import { Role } from "../../../db/models/Role";
import { RefreshTokenInstance } from "../../../db/models/Session";
import { Resolvers } from "../../types/types";

export const UserResolvers : Resolvers = {
    Role: {
        // @ts-ignore
        permissions: async ({ permissionIndices }, _, { models, sessionInfo, logger }) => {
            const indices = JSON.parse(permissionIndices) as number[];
            return indices.map((id) => PermissionEnum[id]);
        },
    },
    User: {
        permissions: async ({ userID }, _, { models, sessionInfo, logger }) => {
            if (!userID) {
                throw new ApolloError("UserID is undefined");
            }
            const user = await models.User.findByPk(userID);
            if (!user) {
                throw new ApolloError("User not found");
            }
            return await user.getPermissionNames();
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
            if (!sessionInfo?.permissions.includes(PermissionEnum[PermissionEnum.VIEW_ADMIN_INFO])) {
                throw new ForbiddenError("User must have permission");
            }
            if (args.offset < 0 || args.limit <= 0 || args.limit > 100 ) {
                throw new UserInputError("Incorrect offset or limit", args);
            }
            return await models.Feedback.findAll(args);
        },
        getAnonymousPermissions: (parent, obj, { models, logger }) => {
            return Role.getPermissionNamesForRole(RoleEnum.ANONYMOUS);
        },
        // @ts-ignore
        user: async(parent, { userID }, { models, logger, sessionInfo }) => {
            if (!sessionInfo) {
                throw new AuthenticationError("User must be authorized");
            }
            if (sessionInfo.permissions.includes(PermissionEnum[PermissionEnum.VIEW_ADMIN_INFO]) || sessionInfo.userID === userID) {
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
            if (!sessionInfo || !sessionInfo.permissions.includes(PermissionEnum[PermissionEnum.VIEW_ADMIN_INFO])) {
                throw new ForbiddenError("User don't have permission");
            }
            return await models.User.findAll(args);
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
            const [affectedRows] = await models.Session.update({ status: "INVALID" },
                allSessions ? { where: { userID: sessionInfo.userID } } : { where: { sessionID: sessionInfo.sessionID } });
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
            if (user.accountStatus !== "EMAIL VERIFICATION") {
                throw new UserInputError("User has incorrect account status");
            }
            let code = await models.Code.findOne({ where: { userID, type: "EMAIL VERIFICATION" } });
            if (code) {
                await models.Code.destroy({ where: { userID, type: "EMAIL VERIFICATION" } });
            }
            code = await models.Code.createEmailVerificationCode(userID, device.deviceID);

            logger(`Issue new verification code = ${code.value}`);
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

            const newUser = await models.User.create({ ...props, accountStatus: "EMAIL VERIFICATION" });
            await newUser.addRole(RoleEnum.ANONYMOUS);

            const session = await newUser.createSession(device.deviceID);

            logger("New account created");
            const tokens = await session.issueTokenPair();
            return { message: "New account created", tokens };
        },
        approveUserEmail: async (parent, { codeValue }, { models, logger, device, sessionInfo }) => {
            if (!sessionInfo) {
                throw new AuthenticationError("User must be logged in");
            }
            const { userID } = sessionInfo;
            const user = await models.User.findByPk(userID);

            if (!user) {
                throw new ApolloError("User not found");
            }
            if (user.accountStatus !== "EMAIL VERIFICATION") {
                throw new UserInputError("User has incorrect account status");
            }
            const code = await models.Code.findOne({ where: { userID, type: "EMAIL VERIFICATION" } });
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
                await user.update({ accountStatus: "EMAIL VERIFIED" });
                await user.addRole(RoleEnum.USER);

                const session = await models.Session.findByPk(sessionInfo.sessionID);
                if (!session) {
                    throw new ApolloError("Session not found");
                }
                return session.issueTokenPair();
            }
        },
        refresh: async (parent, { refreshToken }, { models, logger, device }) => {
            let decoded: RefreshTokenInstance;
            try {
                decoded = jwt.verify(refreshToken, process.env.SECRET_KEY!) as RefreshTokenInstance;
            } catch (e) {
                throw new AuthenticationError("INVALID REFRESH TOKEN WAS PROVIDED");
            }
            const { userID, sessionID, deviceID, iat } = decoded;
            const session = await models.Session.findByPk(sessionID,
                { attributes: ["refreshTokenIat", "status", "deviceID", "userID"] });

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

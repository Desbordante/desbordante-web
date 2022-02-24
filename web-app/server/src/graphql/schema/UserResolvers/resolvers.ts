import { ApolloError, ForbiddenError, UserInputError } from "apollo-server-core";
import { AuthenticationError } from "apollo-server-express";
import jwt from "jsonwebtoken";
import { PermissionEnum, RoleEnum } from "../../../db/models/permissionsConfig";
import { Role } from "../../../db/models/Role";
import { RefreshTokenInstance } from "../../../db/models/Session";
import { Resolvers } from "../../types/types";

export const UserResolvers : Resolvers = {
    User: {
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
        getAnonymousPermissions: (parent, obj, { models, logger }) => {
            return Role.getPermissionForRole(RoleEnum.ANONYMOUS).map(permissionEnum => permissionEnum.toString());
        },
        // @ts-ignore
        user: async(parent, { userID }, { models, logger, sessionInfo }) => {
            if (!sessionInfo) {
                throw new AuthenticationError("User must be authorized");
            }
            if (sessionInfo.permissions.includes(PermissionEnum.VIEW_ADMIN_INFO) || sessionInfo.userID === userID) {
                const user = await models.User.findOne({ where: { userID } });
                if (!user) {
                    throw new UserInputError("User not found");
                }
                return user;
            }
            throw new ForbiddenError("User doesn't have permissions");
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
        reissueVerificationCode: async (parent, { userID }, { models, logger, device, sessionInfo }) => {
            if (sessionInfo) {
                throw new AuthenticationError("User mustn't have sessionInfo");
            }
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

            logger(`Reissue new verification code = ${code.value}`);
            return { message: "Verification code was sent to email", userID };
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

            const code = await models.Code.createEmailVerificationCode(newUser.userID, device.deviceID);

            logger(`New account created, sent verification code = ${code.value}`);
            return {
                message: "Verification code was sent to email",
                userID: newUser.userID,
            };
        },
        approveUserEmail: async (parent, { codeValue, userID }, { models, logger, device, sessionInfo }) => {
            if (sessionInfo) {
                throw new AuthenticationError("User mustn't have sessionInfo");
            }
            const user = await models.User.findByPk(userID);

            if (!user) {
                throw new UserInputError("Incorrect userID was provided");
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

                const session = await user.createSession(device.deviceID);
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

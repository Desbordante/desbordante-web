import { ApolloServer, AuthenticationError } from "apollo-server-express";
import { Application } from "express";
import { graphqlHTTP } from "express-graphql";
import { Sequelize } from "sequelize";
import { ModelsType } from "../db/models";
import { Device, DeviceInfoInstance } from "../db/models/Device";
import { AccessTokenInstance } from "../db/models/Session";

import schema from "./schema/schema";
import { Context } from "./types/context";

const configureGraphQL = async (app: Application, sequelize: Sequelize) => {
    const models = sequelize.models as ModelsType;
    const logger = console.log;
    const graphqlServer = new ApolloServer({
        schema,
        context: async ({ req }) => {
            const requestID = req.headers["x-request-id"];
            if (typeof requestID !== "string") {
                throw new AuthenticationError("requestID wasn't provided");
            }

            const deviceInfoBase64 = req.headers["x-device"];
            if (typeof deviceInfoBase64 !== "string") {
                throw new AuthenticationError("device info wasn't provided");
            }

            const deviceInfo: DeviceInfoInstance = JSON.parse(
                Buffer.from(deviceInfoBase64, "base64").toString()
            );

            let device = await Device.findByPk(deviceInfo.deviceID);
            if (!device) {
                device = await Device.addDevice(deviceInfo);
            } else {
                if (!device.isEqualTo(deviceInfo)) {
                    logger(`FATAL ERROR: Received device with duplicate deviceID = ${device.deviceID}`,
                            JSON.stringify(device), JSON.stringify(deviceInfo));
                }
            }
            const tokenPayload = req.user as AccessTokenInstance | null;
            if (tokenPayload) {
                const { userID, deviceID, sessionID } = tokenPayload;
                if (deviceID !== device.deviceID) {
                    throw new AuthenticationError(
                        `Got incorrect deviceID (In access token = ${deviceID}`
                        + `and in device-info header = ${device.deviceID})`);
                }
                const session = await models.Session.findByPk(sessionID);
                if (!session) {
                    throw new AuthenticationError("Session not found");
                }
                if (session.deviceID !== deviceID) {
                    await session.update({ status: "INVALID" });
                    throw new AuthenticationError("Session has another deviceID");
                }
                if (session.userID != userID) {
                    throw new AuthenticationError("Received incorrect userID");
                }
            }
            if (process.env.KAFKA_TOPIC_NAME === undefined) {
                throw new Error("CANNOT GET TOPIC NAME FROM .env");
            }
            const topicNames = {
                DepAlgs: process.env.KAFKA_TOPIC_NAME,
            };
            const contextObject: Context =
                { models, logger, device, sessionInfo: tokenPayload, topicNames };
            return contextObject;
        },
        introspection: true,
    });
    app.get(
        "/graphql",
        graphqlHTTP({
            schema,
            graphiql: true,
        })
    );
    await graphqlServer.start();

    graphqlServer.applyMiddleware({
        app,
        path: "/graphql",
    });
};

export = configureGraphQL;

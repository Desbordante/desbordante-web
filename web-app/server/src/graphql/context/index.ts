import { Device, DeviceInfoInstance } from "../../db/models/UserData/Device";
import { AccessTokenInstance } from "../../db/models/UserData/Session";
import { AuthenticationError } from "apollo-server-express";
import { Context } from "../types/context";
import { IncomingHttpHeaders } from "http";
import { InvalidHeaderError } from "../types/errorTypes";
import { ModelsType } from "../../db/models";
import config from "../../config";
import { mock } from "./mock";
import getTokenPayloadIfValid from "./tokenValidator";
import { sequelize } from "../../db/sequelize";

const compareDevices = async (
    models: ModelsType,
    device: Device,
    sessionInfo: AccessTokenInstance
) => {
    const { userID, deviceID, sessionID } = sessionInfo;
    if (deviceID !== device.deviceID) {
        throw new AuthenticationError(
            `Got incorrect deviceID (In access token = ${deviceID}` +
                `and in device-info header = ${device.deviceID})`
        );
    }
    const session = await models.Session.findByPk(sessionID);
    if (!session) {
        throw new AuthenticationError("Session not found");
    }
    if (session.deviceID !== deviceID) {
        await session.update({ status: "INVALID" });
        throw new AuthenticationError("Session has another deviceID");
    }
    if (session.userID !== userID) {
        throw new AuthenticationError("Received incorrect userID");
    }
    if (session.status === "INVALID") {
        throw new AuthenticationError("Session is INVALID");
    }
};

export const createContext = async (headers: IncomingHttpHeaders): Promise<Context> => {
    let requestID = headers["x-request-id"];
    if (typeof requestID !== "string") {
        if (config.isDevelopment) {
            requestID = "MockRequestID";
        } else {
            throw new InvalidHeaderError("requestID wasn't provided");
        }
    }

    let deviceInfoBase64 = headers["x-device"];
    if (typeof deviceInfoBase64 !== "string") {
        if (config.isDevelopment) {
            deviceInfoBase64 = mock.deviceInfoBase64;
        } else {
            throw new InvalidHeaderError("Device info wasn't provided");
        }
    }

    const deviceInfo: DeviceInfoInstance = JSON.parse(
        Buffer.from(deviceInfoBase64, "base64").toString()
    );

    const models = sequelize.models as ModelsType;

    const [device, created] = await models.Device.findOrCreate({
        where: { ...deviceInfo },
    });
    if (created) {
        console.log(`New device object ${device.deviceID} was created`);
    }
    const sessionInfo = getTokenPayloadIfValid(headers, config.keys.secretKey);
    if (sessionInfo) {
        await compareDevices(models, device, sessionInfo);
    }
    const { topicNames } = config;

    return {
        models,
        logger: console.log,
        device,
        sessionInfo,
        topicNames,
    };
};

export default createContext;

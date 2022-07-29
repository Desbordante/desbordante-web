import { AccessTokenInstance } from "../../db/models/UserData/Session";
import { Device } from "../../db/models/UserData/Device";
import { ModelsType } from "../../db/models";

export interface Context {
    models: ModelsType;
    logger: typeof console.log;
    device: Device;
    sessionInfo: AccessTokenInstance | null;
    topicNames: {
        tasks: string;
    };
}

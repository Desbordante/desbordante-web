import { ModelsType } from "../../db/models";
import { Device } from "../../db/models/UserInfo/Device";
import { AccessTokenInstance } from "../../db/models/UserInfo/Session";

export interface Context {
    models: ModelsType;
    logger: typeof console.log;
    device: Device,
    sessionInfo: AccessTokenInstance | null,
    topicNames: {
        DepAlgs: string
    }
}

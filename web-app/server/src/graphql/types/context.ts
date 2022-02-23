import { ModelsType } from "../../db/models";
import { Device } from "../../db/models/Device";
import { AccessTokenInstance } from "../../db/models/Session";

export interface Context {
    models: ModelsType;
    logger: typeof console.log;
    device: Device,
    sessionInfo: AccessTokenInstance | null,
    topicNames: {
        DepAlgs: string
    }
}

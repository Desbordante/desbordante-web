import { Ar, Cfd, Fd } from "../../../types/types";
import { ApolloError } from "apollo-server-core";
import config from "../../../../config";
import { createObjectCsvWriter } from "csv-writer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export abstract class AbstractWriter<T extends Fd | Cfd | Ar> {
    public constructor(protected deps: T[]) {
        if (deps.length === 0) {
            throw new ApolloError(
                "Results cannot be written when an empty primitives list is received"
            );
        }
    }

    abstract transformDep(dep: T): { lhs: string; rhs: string };

    public async toCsv(): Promise<string> {
        const records = this.deps.map(this.transformDep);
        const fileID = uuidv4();
        const { protocol, host, port } = config.hosts.server;
        const resultsPath = path.resolve(config.directories.results, `${fileID}.csv`);

        const writer = createObjectCsvWriter({
            path: resultsPath,
            header: Object.keys(this.deps[0]).map((key) => ({ id: key, title: key })),
        });

        await writer.writeRecords(records).catch((reason) => {
            throw new ApolloError(reason);
        });

        return `${protocol}://${host}:${port}/${config.directories.results}/${fileID}.csv`;
    }
}

import "jspdf-autotable";
import { Ar, Cfd, Fd } from "../../../types/types";
import { ApolloError } from "apollo-server-core";
import config from "../../../../config";
import { createObjectCsvWriter } from "csv-writer";
import { jsPDF } from "jspdf";
import path from "path";
import { v4 as uuidv4 } from "uuid";


export abstract class AbstractWriter<T extends Fd | Cfd | Ar> {

    protected header: any[];
    protected constructor(protected deps: T[]) {
        if (deps.length === 0) {
            throw new ApolloError(
                "Results cannot be written when an empty primitives list is received"
            );
        }
    }

    abstract transformDepCsv(dep: T): { lhs: string; rhs: string };

    abstract transformDepPdf(dep: T): any[];

    public async toCsv(): Promise<string> {
        const records = this.deps.map(this.transformDepCsv);
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

    public async toPdf(): Promise<string> {
        const records = this.deps.map(this.transformDepPdf);
        const fileID = uuidv4();
        const { protocol, host, port } = config.hosts.server;
        const resultsPath = path.resolve(config.directories.results, `${fileID}.pdf`);

        const doc = new jsPDF();
        (doc as any).autoTable({
            head: [this.header],
            body: records,
            theme: "grid",
            styles: { halign : "center" },
            headStyles: { fillColor : "#6C35C7" },
            alternateRowStyles: { fillColor : "#E7DDFC" },
            tableLineColor: "#6C35C7",
            tableLineWidth: 0.1,
        });

        doc.save(resultsPath);

        return `${protocol}://${host}:${port}/${config.directories.results}/${fileID}.pdf`;
    }
}

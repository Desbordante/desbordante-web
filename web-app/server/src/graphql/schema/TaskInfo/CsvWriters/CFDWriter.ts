import { AbstractWriter } from "./AbstractWriter";
import { Cfd } from "../../../types/types";

export class CFDWriter extends AbstractWriter<Cfd> {

    public constructor(deps: Cfd[]) {
        super(deps);
        this.header = ["lhs", "rhs", "confidence", "support"];
    }

    transformDepCsv(dep: Cfd): {
        lhs: string;
        rhs: string;
        support: number;
        confidence: number;
    } {
        return {
            lhs: dep.lhs.map((dep) => dep.column.name).join("|"),
            rhs: dep.rhs.column.name,
            support: dep.support,
            confidence: dep.confidence,
        };
    }

    transformDepPdf(dep: Cfd) {
        return [
            dep.lhs.map((dep) => dep.column.name).join("|"),
            dep.rhs.column.name,
            dep.confidence,
            dep.support,
        ];
    }
}

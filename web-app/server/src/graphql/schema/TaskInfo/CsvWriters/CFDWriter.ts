import { AbstractWriter, TransformedDep } from "./AbstractWriter";
import { Cfd, DownloadingTaskProps } from "../../../types/types";

export class CFDWriter extends AbstractWriter<Cfd> {
    public constructor(deps: Cfd[], props: DownloadingTaskProps) {
        super(deps, props);
        this.header = ["LHS", "RHS", "CONFIDENCE", "SUPPORT"];
    }
    /*
    transformDepCsv(dep: Cfd): {
        lhs: string;
        rhs: string;
        support: number;
        confidence: number;
    } {
        return {
            lhs: dep.lhs.map(({ column }) => column.name).join("|"),
            rhs: dep.rhs.column.name,
            support: dep.support,
            confidence: dep.confidence,
        };
    }
    */

    transformDep(dep: Cfd): TransformedDep {
        return [
            dep.lhs.map(({ column, pattern }) => `${column.name}=${pattern}`).join("|"),
            `${dep.rhs.column.name}=${dep.rhs.pattern}`,
            dep.confidence,
            dep.support,
        ];
    }
}

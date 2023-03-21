import { AbstractWriter, TransformedDep } from "./AbstractWriter";
import { Cfd, DownloadingTaskProps } from "../../../types/types";

export class CFDWriter extends AbstractWriter<Cfd> {
    public constructor(deps: Cfd[], props: DownloadingTaskProps) {
        super(deps, props);
        this.header = ["LHS", "RHS", "CONFIDENCE", "SUPPORT"];
    }

    transformDep(dep: Cfd): TransformedDep {
        return [
            dep.lhs
                .map(({ column, pattern }) => `${column.name}=${pattern}`)
                .join(CFDWriter.colDelimiter),
            `${dep.rhs.column.name}=${dep.rhs.pattern}`,
            dep.confidence,
            dep.support,
        ];
    }
}

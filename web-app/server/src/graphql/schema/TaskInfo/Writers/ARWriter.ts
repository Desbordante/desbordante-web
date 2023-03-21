import { Ar, DownloadingTaskProps } from "../../../types/types";
import { AbstractWriter } from "./AbstractWriter";

export class ARWriter extends AbstractWriter<Ar> {
    public constructor(deps: Ar[], props: DownloadingTaskProps) {
        super(deps, props);
        this.header = ["LHS", "RHS", "CONFIDENCE"];
    }

    transformDep(dep: Ar) {
        return [
            dep.lhs.join(ARWriter.colDelimiter),
            dep.rhs.join(ARWriter.colDelimiter),
            dep.confidence,
        ];
    }
}

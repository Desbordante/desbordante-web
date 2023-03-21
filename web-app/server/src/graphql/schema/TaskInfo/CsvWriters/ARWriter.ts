import { Ar, DownloadingTaskProps } from "../../../types/types";
import { AbstractWriter } from "./AbstractWriter";

export class ARWriter extends AbstractWriter<Ar> {
    public constructor(deps: Ar[], props: DownloadingTaskProps) {
        super(deps, props);
        this.header = ["LHS", "RHS", "CONFIDENCE"];
    }

    /*
    transformDepCsv(dep: Ar): {
        lhs: string;
        rhs: string;
        confidence: number;
    } {
        return {
            lhs: dep.lhs.join("|"),
            rhs: dep.rhs.join("|"),
            confidence: dep.confidence,
        };
    }
    */

    transformDep(dep: Ar) {
        return [dep.lhs.join("|"), dep.rhs.join("|"), dep.confidence];
    }
}

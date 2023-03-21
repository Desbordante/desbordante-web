import { AbstractWriter, TransformedDep } from "./AbstractWriter";
import { DownloadingTaskProps, Fd } from "../../../types/types";

export class FDWriter extends AbstractWriter<Fd> {
    public constructor(deps: Fd[], props: DownloadingTaskProps) {
        super(deps, props);
        this.header = ["LHS", "RHS"];
    }

    /*
    transformDepCsv(dep: Fd): {
        lhs: string;
        rhs: string;
    } {
        return {
            lhs: dep.lhs.map((dep) => dep.name).join("|"),
            rhs: dep.rhs.name,
        };
    }
    */

    transformDep(dep: Fd): TransformedDep {
        return [dep.lhs.map((dep) => dep.name).join("|"), dep.rhs.name];
    }
}

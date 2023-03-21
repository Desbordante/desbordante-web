import { AbstractWriter, TransformedDep } from "./AbstractWriter";
import { DownloadingTaskProps, Fd } from "../../../types/types";

export class FDWriter extends AbstractWriter<Fd> {
    public constructor(deps: Fd[], props: DownloadingTaskProps) {
        super(deps, props);
        this.header = ["LHS", "RHS"];
    }

    transformDep(dep: Fd): TransformedDep {
        return [
            dep.lhs.map(({ name }) => name).join(FDWriter.colDelimiter),
            dep.rhs.name,
        ];
    }
}

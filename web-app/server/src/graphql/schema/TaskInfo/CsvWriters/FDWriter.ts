import { AbstractWriter } from "./AbstractWriter";
import { Fd } from "../../../types/types";

export class FDWriter extends AbstractWriter<Fd> {

    public constructor(deps: Fd[]) {
        super(deps);
        this.header = ["lhs", "rhs"];
    }
    transformDepCsv(dep: Fd): {
        lhs: string;
        rhs: string;
    } {
        return {
            lhs: dep.lhs.map((dep) => dep.name).join("|"),
            rhs: dep.rhs.name,
        };
    }

    transformDepPdf(dep: Fd) {
        return [dep.lhs.map((dep) => dep.name).join("|"), dep.rhs.name];
    }
}

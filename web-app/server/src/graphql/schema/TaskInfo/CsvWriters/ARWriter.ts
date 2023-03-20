import { AbstractWriter } from "./AbstractWriter";
import { Ar } from "../../../types/types";

export class ARWriter extends AbstractWriter<Ar> {

    public constructor(deps: Ar[]) {
        super(deps);
        this.header = ["lhs", "rhs", "confidence"];
    }
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

    transformDepPdf(dep: Ar) {
        return [dep.lhs.join("|"), dep.rhs.join("|"), dep.confidence];
    }
}

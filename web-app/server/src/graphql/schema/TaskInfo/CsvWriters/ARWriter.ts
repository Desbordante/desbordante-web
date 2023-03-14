import { AbstractWriter } from "./AbstractWriter";
import { Ar } from "../../../types/types";

export class ARWriter extends AbstractWriter<Ar> {
    transformDep(dep: Ar): {
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
}

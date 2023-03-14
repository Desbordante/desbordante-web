import { AbstractWriter } from "./AbstractWriter";
import { Cfd } from "../../../types/types";

export class CFDWriter extends AbstractWriter<Cfd> {
    transformDep(dep: Cfd): {
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
}

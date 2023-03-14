import { AbstractWriter } from "./AbstractWriter";
import { Fd } from "../../../types/types";

export class FDWriter extends AbstractWriter<Fd> {
    transformDep(dep: Fd): {
        lhs: string;
        rhs: string;
    } {
        return {
            lhs: dep.lhs.map((dep) => dep.name).join("|"),
            rhs: dep.rhs.name,
        };
    }
}

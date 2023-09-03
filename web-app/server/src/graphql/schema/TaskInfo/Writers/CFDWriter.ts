import { AbstractWriter, TransformedDep } from "./AbstractWriter";
import { Cfd, DownloadingTaskProps, Item } from "../../../types/types";

export class CFDWriter extends AbstractWriter<Cfd> {
    public constructor(deps: Cfd[], props: DownloadingTaskProps) {
        super(deps, props);
        this.header = ["LHS", "RHS"];
    }

    transformDep({ lhs, rhs }: Cfd): TransformedDep {
        const toString = ({ column, pattern }: Item) => `${column.name}=${pattern}`;
        return [lhs.map(toString).join(CFDWriter.colDelimiter), toString(rhs)];
    }
}

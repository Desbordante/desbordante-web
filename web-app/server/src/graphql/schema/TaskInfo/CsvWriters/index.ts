import { Ar, Cfd, Fd } from "../../../types/types";
import { ARWriter } from "./ARWriter";
import { ApolloError } from "apollo-server-core";
import { CFDWriter } from "./CFDWriter";
import { FDWriter } from "./FDWriter";
import { MainPrimitiveType } from "../../../../db/models/TaskData/configs/GeneralTaskConfig";

export const getSpecificWriter = (type: MainPrimitiveType, deps: Fd[] | Cfd[] | Ar[]) => {
    switch (type) {
        case "AR":
            return new ARWriter(deps as Ar[]);
        case "FD" || "TypoFD":
            return new FDWriter(deps as Fd[]);
        case "CFD":
            return new CFDWriter(deps as Cfd[]);
    }
    throw new ApolloError(
        `Results for ${type} cannot be written, as it is not currently supported`
    );
};

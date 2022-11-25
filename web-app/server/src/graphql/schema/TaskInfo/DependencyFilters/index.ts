import { ARFilter } from "./ARFilter";
import { AbstractFilter } from "./AbstractFilter";
import { CFDFilter } from "./CFDFilter";
import { FDFilter } from "./FDFilter";
import { GraphQLError } from "graphql";
import { MainPrimitiveType } from "../../../../db/models/TaskData/configs/GeneralTaskConfig";

const getSpecificFilterConstructor = (type: MainPrimitiveType) => {
    type = AbstractFilter.getRealPrimitiveType(type);
    switch (type) {
        case "AR":
            return ARFilter;
        case "FD":
            return FDFilter;
        case "CFD":
            return CFDFilter;
    }
    throw new GraphQLError("Received incorrect type");
};

export const getSpecificFilter = async (
    type: MainPrimitiveType,
    params: ConstructorParameters<ReturnType<typeof getSpecificFilterConstructor>>
) => {
    const filterConstructor = getSpecificFilterConstructor(type);
    const specificFilter = new filterConstructor(...params);
    await specificFilter.initArgs();
    return specificFilter;
};

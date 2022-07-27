import { DBTaskPrimitiveType } from "./configs/GeneralTaskConfig";

export const getSpecificTableName = (
    prefix: DBTaskPrimitiveType | "",
    postfix: "Result" | "Config"
) => `${prefix}Tasks${postfix}` as const;
export const getTableOptions = (
    primitive: DBTaskPrimitiveType | "",
    postfix: "Result" | "Config"
) =>
    ({
        tableName: getSpecificTableName(primitive, postfix),
        updatedAt: false,
        paranoid: true,
    } as const);
export const getResultTableOptions = (primitive: DBTaskPrimitiveType | "") =>
    getTableOptions(primitive, "Result");
export const getConfigTableOptions = (primitive: DBTaskPrimitiveType | "" = "") =>
    getTableOptions(primitive, "Config");

import { BOOLEAN, INTEGER, STRING, UUID } from "sequelize";
import { Column, ForeignKey, IsUUID, Model, Table } from "sequelize-typescript";
import { FileInfo } from "./FileInfo";
import { FileProps } from "../../../graphql/types/types";
import { GraphQLError } from "graphql";

@Table({
    paranoid: true,
    updatedAt: false,
    createdAt: false,
    tableName: "FilesFormat",
})
export class FileFormat extends Model {
    @IsUUID(4)
    @ForeignKey(() => FileInfo)
    @Column({ type: UUID, primaryKey: true })
    fileID!: string;

    @Column({ type: STRING, allowNull: false })
    inputFormat!: "SINGULAR" | "TABULAR";

    // for "SINGULAR"

    @Column({ type: INTEGER, allowNull: true })
    tidColumnIndex!: number | null;

    @Column({ type: INTEGER, allowNull: true })
    itemColumnIndex!: number | null;

    // for "TABULAR"

    @Column({ type: BOOLEAN, allowNull: true })
    hasTid!: boolean | null;

    // TODO (vs9h): refactor
    static createFileFormatIfPropsValid = async (file: FileInfo, props: FileProps) => {
        const { inputFormat, tidColumnIndex, itemColumnIndex, hasTid } = props;
        if (inputFormat === undefined) {
            throw new GraphQLError("You must provide file input format", {
                extensions: { code: "UserInputError" },
            });
        }
        switch (inputFormat) {
            case "SINGULAR":
                if (tidColumnIndex == null) {
                    throw new GraphQLError("tidColumnIndex wasn't provided", {
                        extensions: { code: "UserInputError" },
                    });
                }
                if (itemColumnIndex == null) {
                    throw new GraphQLError("itemColumnIndex wasn't provided", {
                        extensions: { code: "UserInputError" },
                    });
                }
                if (tidColumnIndex < 1) {
                    throw new GraphQLError("invalid tidColumnIndex (less, than 1)", {
                        extensions: { code: "UserInputError" },
                    });
                }
                if (itemColumnIndex < 1) {
                    throw new GraphQLError("invalid itemColumnIndex (less, than 1)", {
                        extensions: { code: "UserInputError" },
                    });
                }
                if (itemColumnIndex === tidColumnIndex) {
                    throw new GraphQLError("item column index equal to transaction id", {
                        extensions: { code: "UserInputError" },
                    });
                }
                break;
            case "TABULAR":
                if (hasTid == null) {
                    throw new GraphQLError("hasTid property wasn't provided", {
                        extensions: { code: "UserInputError" },
                    });
                }
                break;
        }
        return (await file.$create("fileFormat", { ...props })) as FileFormat;
    };
}

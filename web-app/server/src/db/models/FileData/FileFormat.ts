import { BOOLEAN, INTEGER, STRING, UUID } from "sequelize";
import { Column, ForeignKey, IsUUID, Model, Table } from "sequelize-typescript";
import { FileInfo } from "./FileInfo";
import { FileProps } from "../../../graphql/types/types";
import { UserInputError } from "apollo-server-core";

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
    static buildFileFormatIfPropsValid = (file: FileInfo, props: FileProps) => {
        const { inputFormat, tidColumnIndex, itemColumnIndex, hasTid } = props;
        if (inputFormat === undefined) {
            throw new UserInputError("You must provide file input format");
        }
        switch (inputFormat) {
            case "SINGULAR":
                if (tidColumnIndex == null) {
                    throw new UserInputError("tidColumnIndex wasn't provided", {
                        tidColumnIndex,
                    });
                }
                if (itemColumnIndex == null) {
                    throw new UserInputError("itemColumnIndex wasn't provided", {
                        itemColumnIndex,
                    });
                }
                if (tidColumnIndex < 1) {
                    throw new UserInputError("invalid tidColumnIndex (less, than 1)", {
                        tidColumnIndex,
                    });
                }
                if (itemColumnIndex < 1) {
                    throw new UserInputError("invalid itemColumnIndex (less, than 1)", {
                        tidColumnIndex,
                    });
                }
                if (itemColumnIndex === tidColumnIndex) {
                    throw new UserInputError(
                        "item column index equal to transaction id",
                        { tidColumnIndex, itemColumnIndex }
                    );
                }
                break;
            case "TABULAR":
                if (hasTid == null) {
                    throw new UserInputError("You must provide hasTid property");
                }
                break;
            default:
                throw new UserInputError("Provided incorrect input format", {
                    inputFormat,
                });
        }

        return FileFormat.build({
            ...props,
            fileID: file.fileID,
        });
    };
}

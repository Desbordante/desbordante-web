import { ApolloError } from "apollo-server-core";
import fs from "fs";
import path from "path";
import { BOOLEAN, INTEGER, STRING, TEXT, UUID, UUIDV4 } from "sequelize";
import { BelongsTo, Column, ForeignKey, HasMany, IsUUID, Model, Table, Unique } from "sequelize-typescript";
import { finished } from "stream/promises";
import { generateHeaderByPath } from "../../../graphql/schema/TaskCreating/generateHeader";
import { FileProps } from "../../../graphql/types/types";
import { BaseTaskConfig } from "../TaskData/BaseTaskConfig";
import { User } from "./User";

@Table({
    paranoid: true,
    updatedAt: false,
    createdAt: false,
    tableName: "FilesInfo",
})
export class FileInfo extends Model {
    @IsUUID(4)
    @Column({
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
    })
    ID!: string;

    @ForeignKey(() => User)
    @Column({ type: UUID, allowNull: true })
    userID?: string;

    @BelongsTo(() => User)
    user?: User;

    @HasMany(() => BaseTaskConfig)
    baseConfigs?: [BaseTaskConfig];

    @Column({ type: BOOLEAN, defaultValue: false, allowNull: false })
    isBuiltIn!: boolean;

    @Column(STRING)
    mimeType?: string;

    @Column(STRING)
    encoding?: string;

    @Column({ type: TEXT, allowNull: true })
    fileName!: string;

    @Column({ type: TEXT, allowNull: false })
    originalFileName!: string;

    @Column({ type: BOOLEAN, allowNull: false })
    hasHeader!: boolean;

    @Column({ type: STRING, allowNull: false })
    delimiter!: string;

    @Column(TEXT)
    renamedHeader!: string;

    @Column(INTEGER)
    rowsCount?: number;

    @Unique
    @Column(STRING)
    path!: string;

    static getPathToUploadedDataset = (fileName: string) => {
        if (!require.main) {
            throw Error("FATAL SERVER ERROR");
        }
        const rootPath = path.dirname(require.main.filename).split("/");
        rootPath.pop();
        rootPath.pop(); // remove folder 'bin'
        rootPath.push("uploads"); // add folder 'uploads'
        rootPath.push(fileName); // add file '${fileID}.csv'
        return rootPath.join("/");
    };

    generateHeader = async () => {
        const file = await FileInfo.findByPk(this.ID);
        if (!file) {
            throw new ApolloError("File not found");
        }
        const { path, hasHeader, delimiter } = file;
        return await generateHeaderByPath(path, hasHeader, delimiter);
    };

    static uploadDataset = async (props: FileProps, table: any, userID: string | null = null) => {
        const { createReadStream, filename: originalFileName, mimetype: mimeType, encoding } = await table;

        const stream = createReadStream();
        const file = await FileInfo.create(
            { ...props, encoding, mimeType, originalFileName, userID });

        const fileID = file.ID;
        const fileName = `${fileID}.csv`;

        await file.update({ fileName, path: FileInfo.getPathToUploadedDataset(fileName) });

        const out = fs.createWriteStream(`uploads/${fileName}`);
        stream.pipe(out);
        await finished(out);

        await file.update({ renamedHeader: JSON.stringify(await file.generateHeader()) });
        return file;
    };
}

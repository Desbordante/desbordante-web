import { ApolloError } from "apollo-server-core";
import fs from "fs";
import path from "path";
import { BOOLEAN, INTEGER, STRING, TEXT, UUID, UUIDV4 } from "sequelize";
import { BelongsTo, Column, ForeignKey, HasMany, HasOne, IsUUID, Model, Table, Unique } from "sequelize-typescript";
import { finished } from "stream/promises";
import { generateHeaderByPath } from "../../../graphql/schema/TaskCreating/generateHeader";
import { FileProps } from "../../../graphql/types/types";
import { BaseTaskConfig } from "../TaskData/BaseTaskConfig";
import { User } from "./User";
import { FileFormat } from "./FileFormat";
import { findAndUpdateFileRowsAndColumnsCount } from "../../../graphql/schema/TaskCreating/csvValidator";
import { BuiltInDatasetInfoType, getPathToBuiltInDataset } from "../../initBuiltInDatasets";

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

    @HasOne(() => FileFormat)
    fileFormat?: FileFormat;

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

    @Column({ type: INTEGER, allowNull: true })
    rowsCount!: number;

    @Column({ type: INTEGER, allowNull: true })
    countOfColumns!: number;

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

    static saveBuiltInDataset = async (props: BuiltInDatasetInfoType) => {
        const { fileName, datasetProps } = props;
        const withFileFormat = props.datasetProps.inputFormat != null;

        const path = getPathToBuiltInDataset(props.fileName);
        const { hasHeader, delimiter } = datasetProps;
        let header: string[] | null = await generateHeaderByPath(path, hasHeader, delimiter);
        if (withFileFormat) {
            header = null;
        }
        const renamedHeader = JSON.stringify(header);

        const [file, created] = await FileInfo.findOrCreate({
            where: { path },
            defaults: {
                fileName, originalFileName: fileName, renamedHeader,
                isBuiltIn: true, hasHeader, delimiter,
            },
        });
        if (created) {
            console.log(`Built in dataset ${fileName} was created`);
        } else {
            console.log(`Built in dataset ${fileName} already exists`);
            return file;
        }
        await findAndUpdateFileRowsAndColumnsCount(file, delimiter);

        if (withFileFormat) {
            await FileFormat.createFileFormatIfPropsValid(file, datasetProps);
        }
        return file;
    };

    static uploadDataset = async (datasetProps: FileProps, table: any, userID: string | null = null, withFileFormat = false) => {
        const { createReadStream, filename: originalFileName, mimetype: mimeType, encoding } = await table;

        const stream = createReadStream();
        const file = await FileInfo.create(
            { ...datasetProps, encoding, mimeType, originalFileName, userID });

        const fileID = file.ID;
        const fileName = `${fileID}.csv`;

        const path = FileInfo.getPathToUploadedDataset(fileName);

        await file.update({ fileName, path });

        const out = fs.createWriteStream(`uploads/${fileName}`);
        stream.pipe(out);
        await finished(out);

        await file.update({ renamedHeader: JSON.stringify(await file.generateHeader()) });

        // throws an UserInputError, if file is invalid
        await findAndUpdateFileRowsAndColumnsCount(file, datasetProps.delimiter);

        if (withFileFormat) {
            await FileFormat.createFileFormatIfPropsValid(file, datasetProps);
        }

        return file;
    };
}

import { Sequelize } from "sequelize";
import async from "async";
import { generateHeaderByPath }  from "../graphql/schema/TaskCreating/generateHeader";
import path from "path";

const getPathToBuiltInDataset = (fileName: string) => {
    if (!require.main) {
        throw Error("FATAL SERVER ERROR");
    }
    const rootPath = path.dirname(require.main.filename).split("/");
    rootPath.pop();
    rootPath.pop(); // remove folder 'bin'
    rootPath.pop(); // remove folder 'server'
    rootPath.pop(); // remove folder 'web-app'
    rootPath.push("build"); // add folder 'build'
    rootPath.push("target"); // add folder 'target'
    rootPath.push("inputData"); // add folder 'inputData'
    rootPath.push(fileName); // add file '*.csv'
    return rootPath.join("/");
};

const initBuiltInDatasets = async (sequelize: Sequelize) => {
    const allowedDatasets = [
        { fileName: "EpicMeds.csv", delimiter: "|", hasHeader: true },
        { fileName: "WDC_age.csv", delimiter: ",", hasHeader: true },
        { fileName: "TestLong.csv", delimiter: ",", hasHeader: true },
        { fileName: "Workshop.csv", delimiter: ",", hasHeader: true },
        { fileName: "breast_cancer.csv", delimiter: ",", hasHeader: true },
    ];
    return await async.eachSeries(allowedDatasets,
        ({ fileName, delimiter, hasHeader }, callback) => {
        const path = getPathToBuiltInDataset(fileName);

        sequelize.models.FileInfo.findOrCreate({
            where: { path },
            defaults: {
                fileName, originalFileName: fileName,
                isBuiltIn: true, hasHeader, delimiter,
            },
        }
        ).then(async ([file, created]) => {
                if (!created) {
                    console.log("File already exists");
                } else {
                    const renamedHeader = JSON.stringify(await generateHeaderByPath(path, hasHeader, delimiter));
                    await file.update({ renamedHeader });
                    console.log("File was created, header was updated");
                }
                callback();
            });
        });
};

export = initBuiltInDatasets;

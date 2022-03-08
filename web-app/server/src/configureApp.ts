import { ApolloError, UserInputError } from "apollo-server-core";
import cors from "cors";
import express, { Application } from "express";
import { graphqlUploadExpress } from "graphql-upload";
import createError from "http-errors";
import morgan from "morgan";
import { isDevelopment } from "./app";
import configureDB from "./db/configureDB";
import { configureSequelizeModels } from "./db/configureSequelize";
import { Device, DeviceInfoInstance } from "./db/models/Authorization/Device";
import { FileInfo } from "./db/models/Authorization/FileInfo";
import { Permission } from "./db/models/Authorization/Permission";
import { RoleType } from "./db/models/Authorization/Role";
import { Session, SessionStatusType } from "./db/models/Authorization/Session";
import { AccountStatusType, User } from "./db/models/Authorization/User";
import { TaskInfo } from "./db/models/TaskData/TaskInfo";
import { sequelize } from "./db/sequelize";
import configureGraphQL from "./graphql/configureGraphQL";
import { CreatingUserProps, IntersectionTaskProps, PrimitiveType } from "./graphql/types/types";
import { initBuiltInDatasets } from "./db/initBuiltInDatasets";

function normalizePort(val: string | undefined) {
    if (val) {
        const port = parseInt(val, 10);
        if (!isNaN(port) && port >= 0) {
            return port;
        }
    }
    const errorMessage = `Incorrect port value ${val}`;
    throw new Error(errorMessage);
}

async function setMiddlewares(app: Application) {
    app.use(cors());
    app.use(graphqlUploadExpress());
    app.use(morgan("dev"));
}

async function createAccountWithLongLiveRefreshToken(roles: RoleType[]) {
    console.log(`Creating accounts for following roles: ${JSON.stringify(roles)}`);
    const answers: string[] = [];
    for (const role of roles) {
        const roleName = role.toLowerCase();
        const props: CreatingUserProps = {
            companyOrAffiliation: "company",
            country: "Russia",
            email: `${roleName}@gmail.com`,
            fullName: roleName,
            occupation: "occupation",
            pwdHash: "pwdHash",
        };
        const accountStatus: AccountStatusType = "EMAIL_VERIFIED";
        const [user, _] = await User.findOrCreate({ where: { ...props, accountStatus } });
        await user.addRole(role);

        const deviceInfoString = `{
        "deviceID":"bc6e5ac3-54fd-4041-93b2-a0a5e7dd7405:203313997",
        "userAgent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
        "browser":"Chrome","engine":"Blink",
        "os":"Linux",
        "osVersion":"x86_64","cpu":"amd64",
        "screen":"Current Resolution: 1920x1080, Available Resolution: 1920x1053, Color Depth: 24, Device XDPI: undefined, Device YDPI: undefined",
        "plugins":"PDF Viewer, Chrome PDF Viewer, Chromium PDF Viewer, Microsoft Edge PDF Viewer, WebKit built-in PDF",
        "timeZone":"+03",
        "language":"en-US"}`;

        const deviceInfo = JSON.parse(deviceInfoString) as DeviceInfoInstance;
        let device = await Device.findByPk(deviceInfo.deviceID);
        if (!device) {
            device = await Device.addDevice(deviceInfo);
        } else {
            console.log("Creating account with same deviceID");
            if (!device.isEqualTo(deviceInfo)) {
                console.log(`FATAL ERROR: Received device with duplicate deviceID = ${device.deviceID}`,
                    JSON.stringify(device), JSON.stringify(deviceInfo));
            }
        }
        const status: SessionStatusType = "VALID";
        let session = await Session.findOne({ where: { userID: user.userID, status } });
        if (!session) {
            session = await user.createSession(deviceInfo.deviceID);
        }
        const token = await session.issueAccessToken("30d");
        let answer = "";
        answer += `${roleName} account was successfully created (userID = ${user.userID}, email = ${user.email}, pwdHash = ${user.pwdHash}).\nYou can use token with permissions ${JSON.stringify(await user.getPermissions())}`;
        answer += "\nFor example, you can use plugin ModHeader and set these headers:";
        answer += "\nX-Request-ID: bc6e5ac3-54fd-4041-93b2-a0a5e7dd7405:203313997::4d756056-a2d3-4ea5-8f15-4a72f2689d09";
        answer += "\nX-Device: eyJkZXZpY2VJRCI6ImJjNmU1YWMzLTU0ZmQtNDA0MS05M2IyLWEwYTVlN2RkNzQwNToyMDMzMTM5OTciLCJ1c2VyQWdlbnQiOiJNb3ppbGxhLzUuMCAoWDExOyBMaW51eCB4ODZfNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS85OC4wLjQ3NTguMTAyIFNhZmFyaS81MzcuMzYiLCJicm93c2VyIjoiQ2hyb21lIiwiZW5naW5lIjoiQmxpbmsiLCJvcyI6IkxpbnV4Iiwib3NWZXJzaW9uIjoieDg2XzY0IiwiY3B1IjoiYW1kNjQiLCJzY3JlZW4iOiJDdXJyZW50IFJlc29sdXRpb246IDE5MjB4MTA4MCwgQXZhaWxhYmxlIFJlc29sdXRpb246IDE5MjB4MTA1MywgQ29sb3IgRGVwdGg6IDI0LCBEZXZpY2UgWERQSTogdW5kZWZpbmVkLCBEZXZpY2UgWURQSTogdW5kZWZpbmVkIiwicGx1Z2lucyI6IlBERiBWaWV3ZXIsIENocm9tZSBQREYgVmlld2VyLCBDaHJvbWl1bSBQREYgVmlld2VyLCBNaWNyb3NvZnQgRWRnZSBQREYgVmlld2VyLCBXZWJLaXQgYnVpbHQtaW4gUERGIiwidGltZVpvbmUiOiIrMDMiLCJsYW5ndWFnZSI6ImVuLVVTIn0=";
        answer += `\nAuthorization: Bearer ${token}`;
        answers.push(answer);
    }
    return answers;
}

async function createARTask(fileName: string, minConfidence: number, minSupportAR: number,
                            cfdsCompactString: string, valueDictionary: string) {
    const props: IntersectionTaskProps = {
        algorithmName: "AR algorithm",
        type: "AR" as PrimitiveType,
        minConfidence,
        minSupportAR,
    };
    const file = await FileInfo.findOne({ where: { fileName } });
    if (!file) {
        throw new Error(`File not found ${file}`);
    }
    const taskInfo = await TaskInfo.saveToDBIfPropsValid(props, file.ID, null);

    const res = await taskInfo.$get("ARResult");
    if (!res) {
        throw new Error("got null result");
    }
    await taskInfo.update({
        isExecuted: true, status: "Test data", phaseName: "AR mining",
        currentPhase: 1, progress:100, maxPhase: 1, elapsedTime: 1,
    });
    await res.update({ ARs: cfdsCompactString, valueDictionary });
    return `Created task AR with id = ${taskInfo.taskID} (dataset ${fileName}).`;
}

// Function for client (test UI)
async function createCfdTask(fileName: string, cfdsStr: string,
                             pieChartDataWithoutPatternsStr: string,
                             pieChartDataWithPatternsStr: string,
                             maxLHS = -1, minConfidence = 1, minSupportCFD = 1) {
    type cfd = { l: [string], lp:[string], r: string, rp: string }
    const json: { cfds: [cfd] } = JSON.parse(cfdsStr);

    type WithoutPatternRow = { id: number, value: number };
    const pieChartDataWithoutPatternsJson:
        { lhs: [WithoutPatternRow], rhs: [WithoutPatternRow] }
        = JSON.parse(pieChartDataWithoutPatternsStr);

    type WithPatternRow = { id: number, value: number, pattern: string };
    const pieChartDataWithPatternsJson:
        { lhs: [WithPatternRow], rhs: [WithPatternRow] }
        = JSON.parse(pieChartDataWithPatternsStr);

    const file = await FileInfo.findOne({ where: { fileName } });
    if (!file) {
        throw new Error(`File not found ${file}`);
    }
    const props: IntersectionTaskProps = {
        algorithmName: "CTane",
        type: "CFD" as PrimitiveType,
        maxLHS,
        minConfidence,
        minSupportCFD,
    };
    const taskInfo = await TaskInfo.saveToDBIfPropsValid(props, file.ID, null);

    const res = await taskInfo.$get("CFDResult");
    if (!res) {
        throw new Error("got null result");
    }
    await taskInfo.update({
        isExecuted: true, status: "Test data", phaseName: "CFD mining",
        currentPhase: 1, progress:100, maxPhase: 1, elapsedTime: 1,
    });
    await res.update({ CFDs: JSON.stringify(json) });
    await res.update({ withPatterns: JSON.stringify(pieChartDataWithPatternsJson) });
    await res.update({ withoutPatterns: JSON.stringify(pieChartDataWithoutPatternsJson) });
    return `Created task CFD with id = ${taskInfo.taskID} (dataset ${fileName}).`;
}

async function createBuiltInTasks() {
    const testlong = await createCfdTask(
        "TestLong.csv",
        `[
    { "l": ["First"], "lp": ["1"], "r": "Second", "rp": "2" },
    { "l": ["Third"], "lp": ["1"], "r": "First", "rp": "1" },
    { "l": ["Third"], "lp": ["3"], "r": "First", "rp": "1" },
    { "l": ["Second"], "lp": ["4"], "r": "First", "rp": "3" },
    { "l": ["Third"], "lp": ["4"], "r": "First", "rp": "3" },
    { "l": ["Third"], "lp": ["5"], "r": "First", "rp": "3" },
    { "l": ["Third"], "lp": ["8"], "r": "First", "rp": "5" },
    { "l": ["Second"], "lp": ["4"], "r": "Third", "rp": "5" },
    { "l": ["Third"], "lp": ["5"], "r": "Second", "rp": "4" },
    { "l": ["Third"], "lp": ["2"], "r": "Second", "rp": "3" },
    { "l": ["Third"], "lp": ["4"], "r": "Second", "rp": "3" },
    { "l": ["Third"], "lp": ["8"], "r": "Second", "rp": "3" },
    { "l": ["Third"], "lp": ["1"], "r": "Second", "rp": "2" },
    { "l": ["Third"], "lp": ["3"], "r": "Second", "rp": "2" },
    { "l": ["Third"], "lp": ["7"], "r": "Second", "rp": "2" },
    { "l": ["First","Third"], "lp": ["_","_"], "r": "Second", "rp": "_" },
    { "l": ["Second","Third"], "lp": ["_","8"], "r": "First", "rp": "_" },
    { "l": ["First","Third"], "lp": ["_","8"], "r": "Second", "rp": "_" },
    { "l": ["First","Third"], "lp": ["_","7"], "r": "Second", "rp": "_" },
    { "l": ["First","Third"], "lp": ["_","5"], "r": "Second", "rp": "_" },
    { "l": ["Second","Third"], "lp": ["_","4"], "r": "First", "rp": "_" },
    { "l": ["First","Third"], "lp": ["_","4"], "r": "Second", "rp": "_" },
    { "l": ["Second","Third"], "lp": ["_","3"], "r": "First", "rp": "_" },
    { "l": ["First","Third"], "lp": ["_","3"], "r": "Second", "rp": "_" },
    { "l": ["Second","Third"], "lp": ["_","2"], "r": "First", "rp": "_" },
    { "l": ["First","Third"], "lp": ["_","2"], "r": "Second", "rp": "_" },
    { "l": ["Second","Third"], "lp": ["_","1"], "r": "First", "rp": "_" },
    { "l": ["First","Third"], "lp": ["_","1"], "r": "Second", "rp": "_" },
    { "l": ["First","Second"], "lp": ["_","3"], "r": "Third", "rp": "_" },
    { "l": ["First","Second"], "lp": ["_","4"], "r": "Third", "rp": "_" },
    { "l": ["First","Second"], "lp": ["5","_"], "r": "Third", "rp": "_" },
    { "l": ["First","Second"], "lp": ["5","2"], "r": "Third", "rp": "6" },
    { "l": ["First","Second"], "lp": ["5","3"], "r": "Third", "rp": "7" },
    { "l": ["First","Second"], "lp": ["3","3"], "r": "Third", "rp": "4" },
    { "l": ["First","Second"], "lp": ["2","_"], "r": "Third", "rp": "_" },
    { "l": ["First","Third"], "lp": ["2","_"], "r": "Second", "rp": "_" },
    { "l": ["First","Second"], "lp": ["2","2"], "r": "Third", "rp": "6" },
    { "l": ["First","Second"], "lp": ["2","3"], "r": "Third", "rp": "2" }]`,
        `
    { "lhs":[{ "id": 0, "value":10.000000 },
        { "id": 1, "value":9.000000 },
        { "id": 2, "value":19.000000 }],
      "rhs":[{ "id": 0, "value":8.500000 },
        { "id": 1, "value":12.500000 },
        { "id": 2, "value":5.500000 }]
    }`,
        `
    { "lhs":[{ "id": 0, "pattern":"1", "value":1.000000 },
    { "id": 0, "pattern":"2", "value":2.000000 },
    { "id": 0, "pattern":"3", "value":0.500000 },
    { "id": 0, "pattern":"5", "value":1.500000 },
    { "id": 0, "pattern":"_", "value":5.000000 },
    { "id": 1, "pattern":"2", "value":1.000000 },
    { "id": 1, "pattern":"3", "value":2.000000 },
    { "id": 1, "pattern":"4", "value":2.500000 },
    { "id": 1, "pattern":"_", "value":3.500000 },
    { "id": 2, "pattern":"1", "value":3.000000 },
    { "id": 2, "pattern":"2", "value":2.000000 },
    { "id": 2, "pattern":"3", "value":3.000000 },
    { "id": 2, "pattern":"4", "value":3.000000 },
    { "id": 2, "pattern":"5", "value":2.500000 },
    { "id": 2, "pattern":"7", "value":1.500000 },
    { "id": 2, "pattern":"8", "value":3.000000 },
    { "id": 2, "pattern":"_", "value":1.000000 }
    ], "rhs":[{ "id": 0, "pattern":"1", "value":2.000000 },
    { "id": 0, "pattern":"3", "value":3.000000 },
    { "id": 0, "pattern":"5", "value":1.000000 },
    { "id": 0, "pattern":"_", "value":2.500000 },
    { "id": 1, "pattern":"2", "value":4.000000 },
    { "id": 1, "pattern":"3", "value":3.000000 },
    { "id": 1, "pattern":"4", "value":1.000000 },
    { "id": 1, "pattern":"_", "value":4.500000 },
    { "id": 2, "pattern":"2", "value":0.500000 },
    { "id": 2, "pattern":"4", "value":0.500000 },
    { "id": 2, "pattern":"5", "value":1.000000 },
    { "id": 2, "pattern":"7", "value":1.000000 },
    { "id": 2, "pattern":"8", "value":0.500000 },
    { "id": 2, "pattern":"_", "value":2.000000 }]}`);
    const ciPublicHIghway700 = await createCfdTask("CIPublicHighway700.csv",`
    [
{ "l": ["CrossingID"], "lp": ["_"], "r": "EmrgncySrvc", "rp": "_" },
{ "l": ["SubmissionType"], "lp": ["_"], "r": "EmrgncySrvc", "rp": "_" },
{ "l": ["ReportBaseId"], "lp": ["_"], "r": "EmrgncySrvc", "rp": "_" },
{ "l": ["HwySys"], "lp": ["_"], "r": "EmrgncySrvc", "rp": "_" },
{ "l": ["HwyClassCD"], "lp": ["_"], "r": "EmrgncySrvc", "rp": "_" },
{ "l": ["HwyClassCD"], "lp": ["1"], "r": "EmrgncySrvc", "rp": "" },
{ "l": ["HwyClassCD"], "lp": ["0"], "r": "EmrgncySrvc", "rp": "" },
{ "l": ["HwyClassrdtpID"], "lp": ["_"], "r": "EmrgncySrvc", "rp": "_" },
{ "l": ["HwyClassrdtpID"], "lp": ["13"], "r": "EmrgncySrvc", "rp": "" },
{ "l": ["HwyClassrdtpID"], "lp": ["16"], "r": "EmrgncySrvc", "rp": "" },
{ "l": ["HwyClassrdtpID"], "lp": ["19"], "r": "EmrgncySrvc", "rp": "" },
{ "l": ["HwyClassrdtpID"], "lp": ["17"], "r": "EmrgncySrvc", "rp": "" },
{ "l": ["HwyClassrdtpID"], "lp": ["18"], "r": "EmrgncySrvc", "rp": "" },
{ "l": ["StHwy1"], "lp": ["_"], "r": "SchlBusChk", "rp": "_" },
{ "l": ["StHwy1"], "lp": ["_"], "r": "EmrgncySrvc", "rp": "_" },
{ "l": ["StHwy1"], "lp": ["1"], "r": "EmrgncySrvc", "rp": "" },
{ "l": ["StHwy1"], "lp": ["2"], "r": "EmrgncySrvc", "rp": "" },
{ "l": ["HwySpeed"], "lp": ["_"], "r": "EmrgncySrvc", "rp": "_" },
{ "l": ["HwySpeed"], "lp": ["NULL"], "r": "EmrgncySrvc", "rp": "" },
{ "l": ["HwySpeedps"], "lp": ["_"], "r": "EmrgncySrvc", "rp": "_" },
{ "l": ["LrsRouteid"], "lp": ["_"], "r": "SchlBusChk", "rp": "_" },
{ "l": ["LrsRouteid"], "lp": ["_"], "r": "EmrgncySrvc", "rp": "_" },
{ "l": ["LrsMilePost"], "lp": ["_"], "r": "EmrgncySrvc", "rp": "_" },
{ "l": ["Aadt"], "lp": ["_"], "r": "EmrgncySrvc", "rp": "_" },
{ "l": ["Aadt"], "lp": ["000260"], "r": "SchlBsCnt", "rp": "0" },
{ "l": ["Aadt"], "lp": ["000500"], "r": "SchlBsCnt", "rp": "0" },
{ "l": ["Aadt"], "lp": ["000050"], "r": "SchlBsCnt", "rp": "0" },
{ "l": ["Aadt"], "lp": ["000040"], "r": "SchlBsCnt", "rp": "0" },
{ "l": ["Aadt"], "lp": ["000150"], "r": "SchlBsCnt", "rp": "0" },
{ "l": ["AadtYear"], "lp": ["_"], "r": "SchlBsCnt", "rp": "_" },
{ "l": ["AadtYear"], "lp": ["_"], "r": "EmrgncySrvc", "rp": "_" },
{ "l": ["AadtYear"], "lp": ["1970"], "r": "EmrgncySrvc", "rp": "" },
{ "l": ["AadtYear"], "lp": ["1988"], "r": "EmrgncySrvc", "rp": "" },
{ "l": ["PctTruk"], "lp": ["_"], "r": "EmrgncySrvc", "rp": "_" },
{ "l": ["SchlBusChk"], "lp": ["_"], "r": "EmrgncySrvc", "rp": "_" },
{ "l": ["SchlBsCnt"], "lp": ["_"], "r": "EmrgncySrvc", "rp": "_" },
{ "l": ["HazmtVeh"], "lp": [""], "r": "SchlBsCnt", "rp": "0" },
{ "l": ["SchlBsCnt"], "lp": ["0"], "r": "EmrgncySrvc", "rp": "" },
{ "l": ["EmrgncySrvc"], "lp": [""], "r": "SchlBsCnt", "rp": "0" },
{ "l": ["HazmtVeh"], "lp": ["_"], "r": "EmrgncySrvc", "rp": "_" }
 ] `,
        `{ "lhs":[{ "id": 0, "value":1.000000 },
{ "id": 1, "value":1.000000 },
{ "id": 2, "value":1.000000 },
{ "id": 3, "value":1.000000 },
{ "id": 4, "value":3.000000 },
{ "id": 5, "value":6.000000 },
{ "id": 6, "value":4.000000 },
{ "id": 7, "value":2.000000 },
{ "id": 8, "value":1.000000 },
{ "id": 9, "value":2.000000 },
{ "id": 10, "value":1.000000 },
{ "id": 11, "value":6.000000 },
{ "id": 12, "value":4.000000 },
{ "id": 13, "value":1.000000 },
{ "id": 14, "value":1.000000 },
{ "id": 15, "value":2.000000 },
{ "id": 16, "value":2.000000 },
{ "id": 17, "value":1.000000 }
], "rhs":[{ "id": 0, "value":0.000000 },
{ "id": 1, "value":0.000000 },
{ "id": 2, "value":0.000000 },
{ "id": 3, "value":0.000000 },
{ "id": 4, "value":0.000000 },
{ "id": 5, "value":0.000000 },
{ "id": 6, "value":0.000000 },
{ "id": 7, "value":0.000000 },
{ "id": 8, "value":0.000000 },
{ "id": 9, "value":0.000000 },
{ "id": 10, "value":0.000000 },
{ "id": 11, "value":0.000000 },
{ "id": 12, "value":0.000000 },
{ "id": 13, "value":0.000000 },
{ "id": 14, "value":2.000000 },
{ "id": 15, "value":8.000000 },
{ "id": 16, "value":0.000000 },
{ "id": 17, "value":30.000000 }
] }`,`{ "lhs":[{ "id": 0, "pattern":"_", "value":1.000000 },
{ "id": 1, "pattern":"_", "value":1.000000 },
{ "id": 2, "pattern":"_", "value":1.000000 },
{ "id": 3, "pattern":"_", "value":1.000000 },
{ "id": 4, "pattern":"0", "value":1.000000 },
{ "id": 4, "pattern":"1", "value":1.000000 },
{ "id": 4, "pattern":"_", "value":1.000000 },
{ "id": 5, "pattern":"13", "value":1.000000 },
{ "id": 5, "pattern":"16", "value":1.000000 },
{ "id": 5, "pattern":"17", "value":1.000000 },
{ "id": 5, "pattern":"18", "value":1.000000 },
{ "id": 5, "pattern":"19", "value":1.000000 },
{ "id": 5, "pattern":"_", "value":1.000000 },
{ "id": 6, "pattern":"1", "value":1.000000 },
{ "id": 6, "pattern":"2", "value":1.000000 },
{ "id": 6, "pattern":"_", "value":2.000000 },
{ "id": 7, "pattern":"NULL", "value":1.000000 },
{ "id": 7, "pattern":"_", "value":1.000000 },
{ "id": 8, "pattern":"_", "value":1.000000 },
{ "id": 9, "pattern":"_", "value":2.000000 },
{ "id": 10, "pattern":"_", "value":1.000000 },
{ "id": 11, "pattern":"000040", "value":1.000000 },
{ "id": 11, "pattern":"000050", "value":1.000000 },
{ "id": 11, "pattern":"000150", "value":1.000000 },
{ "id": 11, "pattern":"000260", "value":1.000000 },
{ "id": 11, "pattern":"000500", "value":1.000000 },
{ "id": 11, "pattern":"_", "value":1.000000 },
{ "id": 12, "pattern":"1970", "value":1.000000 },
{ "id": 12, "pattern":"1988", "value":1.000000 },
{ "id": 12, "pattern":"_", "value":2.000000 },
{ "id": 13, "pattern":"_", "value":1.000000 },
{ "id": 14, "pattern":"_", "value":1.000000 },
{ "id": 15, "pattern":"0", "value":1.000000 },
{ "id": 15, "pattern":"_", "value":1.000000 },
{ "id": 16, "pattern":"", "value":1.000000 },
{ "id": 16, "pattern":"_", "value":1.000000 },
{ "id": 17, "pattern":"", "value":1.000000 }
], "rhs":[{ "id": 14, "pattern":"_", "value":2.000000 },
{ "id": 15, "pattern":"0", "value":7.000000 },
{ "id": 15, "pattern":"_", "value":1.000000 },
{ "id": 17, "pattern":"", "value":13.000000 },
{ "id": 17, "pattern":"_", "value":17.000000 }
] }`, 2, 1, 5);
    const compactARsString = "0.800000:0:1;0.571429:2:1;0.571429:4:1;0.750000:5:1;1.000000:6:1;0.600000:7:1;0.666667:10:1;0.500000:3:2;0.666667:9:2;0.500000:8:3;0.666667:3:8;0.666667:9:3;0.500000:5:4;0.800000:7:4;0.571429:4:7;0.500000:5:10;1.000000:6:7;1.000000:9:8;0.666667:10:8;0.500000:8:10;0.500000:1,2:0;1.000000:0,2:1;0.500000:0,1:2;1.000000:4,5:1;0.666667:1,5:4;0.500000:1,4:5;0.500000:4,7:1;0.666667:1,7:4;0.500000:1,4:7;1.000000:6,7:1;0.666667:1,7:6;1.000000:1,6:7;0.500000:8,10:1;0.500000:1,10:8;0.666667:1,8:10;0.500000:3,8:2;1.000000:2,8:3;0.666667:2,3:8;1.000000:3,9:2;1.000000:2,9:3;0.666667:2,3:9;0.500000:4,7:2;1.000000:2,7:4;1.000000:2,4:7;0.666667:8,9:2;1.000000:2,9:8;1.000000:2,8:9;0.666667:8,9:3;1.000000:3,9:8;0.500000:3,8:9;1.000000:3,8,9:2;1.000000:2,8,9:3;1.000000:2,3,9:8;1.000000:2,3,8:9";
    const valueDictionary = "[MILK,BREAD,BISCUIT,CORNFLAKES,TEA,BOURNVITA,JAM,MAGGI,COFFEE,COCK,SUGER]";

    const rules_kaggle = await createARTask("rules-kaggle.csv", 0.5, 0.1,
        compactARsString, valueDictionary);
    const rules_kaggle_rows_2 = await createARTask("rules-kaggle-rows-2.csv", 0.5, 0.1,
        compactARsString, valueDictionary);

    console.log(testlong, ciPublicHIghway700, rules_kaggle, rules_kaggle_rows_2);
}

async function configureApp() {
    const app = express();
    app.set("port", normalizePort(process.env.SERVER_PORT));

    await configureDB(app)
        .then(() => {
            console.debug("Database was configured successfully");
        })
        .catch(err => {
            throw new Error(`Error while configuring the application ${err}`);
        });

    await sequelize.authenticate()
        .then(() => {
            console.debug("Connection with DB was established");
        })
        .catch(err => {
            throw new Error(`Error while connecting to DB: ${err}`);
        });

    await configureSequelizeModels(sequelize)
        .then(() => {
            console.debug("Models was configured successfully");
        })
        .catch(err => {
            throw new Error(`Error while configuring models ${err}`);
        });

    await Permission.initPermissionsTable()
        .then(() => {
            console.log("Permissions table was initialized");
        });

    await initBuiltInDatasets()
        .then(() => {
            console.debug("BuiltIn datasets was initialized");
        })
        .catch((err: any) => {
            throw new Error(`Error while initializing built-in datasets ${err}`);
        });

    await setMiddlewares(app)
        .then(() => {
            console.debug("Middlewares were successfully applied");
        })
        .catch((err) => {
            console.error(`Error: ${err.message}`);
            throw new Error("Error while setting middlewares");
        });

    await configureGraphQL(app, sequelize)
        .then(() => {
            console.debug("GraphQL was successfully configured");
        })
        .catch((err) => {
            console.error(`Error: ${err.message}`);
            throw new Error("Error while graphql configuring");
        });

    if (isDevelopment) {
        await createAccountWithLongLiveRefreshToken(["ANONYMOUS", "USER", "SUPPORT", "ADMIN", "DEVELOPER"])
            .then(results => results.map(res => console.log(res)))
            .catch(e => console.error("Problems with accounts creating", e.message));
        await createBuiltInTasks()
            .catch(e => console.error("Problems with task creating", e.message));
    }

    // Catch 404 and forward to error handler
    app.use((req, res, next) => {
        next(createError(404));
    });

    // Error handler
    app.use((err: any, req: any, res: any, next: any) => {
        // Set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get("env") === "development" ? err : {};

        res.status(err.status || 500).send(res.locals.error.message);
    });

    return app;
}

export = configureApp;

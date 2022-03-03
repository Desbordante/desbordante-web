import { UserInputError } from "apollo-server-core";
import cors from "cors";
import express, { Application } from "express";
import { graphqlUploadExpress } from "graphql-upload";
import createError from "http-errors";
import morgan from "morgan";
import { isDevelopment } from "./app";
import configureDB from "./db/configureDB";
import { configureSequelizeModels } from "./db/configureSequelize";
import initBuiltInDatasets from "./db/initBuiltInDatasets";
import { Device, DeviceInfoInstance } from "./db/models/Authorization/Device";
import { FileInfo } from "./db/models/Authorization/FileInfo";
import { Permission } from "./db/models/Authorization/Permission";
import { Role, RoleType } from "./db/models/Authorization/Role";
import { Session, SessionStatusType } from "./db/models/Authorization/Session";
import { AccountStatusType, User } from "./db/models/Authorization/User";
import { TaskInfo } from "./db/models/TaskData/TaskInfo";
import { sequelize } from "./db/sequelize";
import configureGraphQL from "./graphql/configureGraphQL";
import { CreatingUserProps, InputMaybe, IntersectionTaskProps, Scalars } from "./graphql/types/types";

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

// Function for client (test UI)
async function createCfdTask() {
    const jsonStr = `[
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
{ "l": ["First","Second"], "lp": ["2","3"], "r": "Third", "rp": "2" }
 ]
`;
    type cfd = { l: [string], lp:[string], r: string, rp: string }
    const json: { cfds: [cfd] } = JSON.parse(jsonStr);

    const pieChartDataJsonStr = `
    { "lhs":[{ "id": 0, "value":10.000000 },
{ "id": 1, "value":9.000000 },
{ "id": 2, "value":19.000000 }
], "rhs":[{ "id": 0, "value":8.500000 },
{ "id": 1, "value":12.500000 },
{ "id": 2, "value":5.500000 }
] }`;
    type WithoutPatternRow = { id: number, value: number };
    const pieChartDataWithoutPatternsJson: { lhs: [WithoutPatternRow], rhs: [WithoutPatternRow] } = JSON.parse(pieChartDataJsonStr);

    const pieChartDataWithPatternsJsonStr = `
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
{ "id": 2, "pattern":"_", "value":2.000000 }
] }`;
    type WithPatternRow = { id: number, value: number, pattern: string };
    const pieChartDataWithPatternsJson: { lhs: [WithPatternRow], rhs: [WithPatternRow] } = JSON.parse(pieChartDataWithPatternsJsonStr);

    const fileName = "TestLong.csv";
    const file = await FileInfo.findOne({ where: { fileName } });
    if (!file) {
        throw new UserInputError("File not found", { fileName });
    }
    const props: IntersectionTaskProps = {
        algorithmName: "CTane",
        // @ts-ignore
        type: "CFD",
        maxLHS: -1,
        minConfidence: 1,
        minSupport: 1,
    };
    const taskInfo = await TaskInfo.saveToDBIfPropsValid(props, file.ID, null);

    const res = await taskInfo.$get("CFDResult");
    if (!res) {
        throw new Error("got nul result");
    }
    await taskInfo.update({
        isExecuted: true, status: "Test data", phaseName: "CFD mining",
        currentPhase: 1, progress:100, maxPhase: 1, elapsedTime: 1,
    });
    await res.update({ CFDs: JSON.stringify(json) });
    await res.update({ withPatterns: JSON.stringify(pieChartDataWithPatternsJson) });
    await res.update({ withoutPatterns: JSON.stringify(pieChartDataWithoutPatternsJson) });
    console.log(`Created task cfd with id = ${taskInfo.taskID}`);
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

    await initBuiltInDatasets(sequelize)
        .then(() => {
            console.debug("BuiltIn datasets was initialized");
        })
        .catch(err => {
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
        await createCfdTask()
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

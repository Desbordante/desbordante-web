import cors from "cors";
import express, { Application } from "express";
import expressJwt from "express-jwt";
import { graphqlUploadExpress } from "graphql-upload";
import createError from "http-errors";
import morgan from "morgan";
import { isDevelopment } from "./app";
import configureDB from "./db/configureDB";
import { configureSequelizeModels } from "./db/configureSequelize";
import initBuiltInDatasets from "./db/initBuiltInDatasets";
import { Device, DeviceInfoInstance } from "./db/models/Device";
import { RoleEnum } from "./db/models/permissionsConfig";
import { Session } from "./db/models/Session";
import { Permission, User } from "./db/models/User";
import { sequelize } from "./db/sequelize";
import configureGraphQL from "./graphql/configureGraphQL";
import { AccessTokenExpiredError } from "./graphql/types/errorTypes";
import { CreatingUserProps } from "./graphql/types/types";

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
    app.use(
        expressJwt({
            secret: process.env.SECRET_KEY!,
            algorithms: ["HS256"],
            credentialsRequired: false,
        })
    );
    // @ts-ignore
    app.use((err, req, res, next) => {
        if (err.name === "UnauthorizedError") {
            res.status(200).send(new AccessTokenExpiredError("invalid token"));
        }
    });
}

async function createAccountWithLongLiveRefreshToken(roles: RoleEnum[]) {
    console.log(`Creating accounts for following roles: ${JSON.stringify(roles.map(role => RoleEnum[role]))}`);
    const answers: string[] = [];
    for (const role of roles) {
        const roleName = RoleEnum[role].toLowerCase();
        const props: CreatingUserProps = {
            companyOrAffiliation: "company",
            country: "Russia",
            email: `${roleName}@gmail.com`,
            fullName: roleName,
            occupation: "occupation",
            pwdHash: "pwdHash",
        };
        const [user, _] = await User.findOrCreate({ where: { ...props, accountStatus: "EMAIL VERIFIED" } });
        await user.addRole(RoleEnum.DEVELOPER);

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
        let session = await Session.findOne({ where: { userID: user.userID } });
        if (!session) {
            session = await user.createSession(deviceInfo.deviceID);
        }
        const token = await session.issueAccessToken("30d");
        let answer = "";
        answer += `${roleName} account was successfully created (userID = ${user.userID}, email = ${user.email}, pwdHash = ${user.pwdHash}).\nYou can use token with permissions ${JSON.stringify(await user.getPermissionNames())}`;
        answer += "\nFor example, you can use plugin ModHeader and set these headers:";
        answer += "\nX-Request-ID: bc6e5ac3-54fd-4041-93b2-a0a5e7dd7405:203313997::4d756056-a2d3-4ea5-8f15-4a72f2689d09";
        answer += "\nX-Device: eyJkZXZpY2VJRCI6ImJjNmU1YWMzLTU0ZmQtNDA0MS05M2IyLWEwYTVlN2RkNzQwNToyMDMzMTM5OTciLCJ1c2VyQWdlbnQiOiJNb3ppbGxhLzUuMCAoWDExOyBMaW51eCB4ODZfNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS85OC4wLjQ3NTguMTAyIFNhZmFyaS81MzcuMzYiLCJicm93c2VyIjoiQ2hyb21lIiwiZW5naW5lIjoiQmxpbmsiLCJvcyI6IkxpbnV4Iiwib3NWZXJzaW9uIjoieDg2XzY0IiwiY3B1IjoiYW1kNjQiLCJzY3JlZW4iOiJDdXJyZW50IFJlc29sdXRpb246IDE5MjB4MTA4MCwgQXZhaWxhYmxlIFJlc29sdXRpb246IDE5MjB4MTA1MywgQ29sb3IgRGVwdGg6IDI0LCBEZXZpY2UgWERQSTogdW5kZWZpbmVkLCBEZXZpY2UgWURQSTogdW5kZWZpbmVkIiwicGx1Z2lucyI6IlBERiBWaWV3ZXIsIENocm9tZSBQREYgVmlld2VyLCBDaHJvbWl1bSBQREYgVmlld2VyLCBNaWNyb3NvZnQgRWRnZSBQREYgVmlld2VyLCBXZWJLaXQgYnVpbHQtaW4gUERGIiwidGltZVpvbmUiOiIrMDMiLCJsYW5ndWFnZSI6ImVuLVVTIn0=";
        answer += `\nAuthorization: Bearer ${token}`;
        answers.push(answer);
    }
    return answers;
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
        await createAccountWithLongLiveRefreshToken([RoleEnum.USER, RoleEnum.SUPPORT, RoleEnum.ADMIN, RoleEnum.DEVELOPER])
            .then(results => results.map(res => console.log(res)))
            .catch(e => console.error("Problems with accounts creating", e.message));
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

import { testQuery, toAuthorizationHeader } from "../../util";
import { User } from "../../../db/models/UserData/User";

import { createUser, createUserVariables } from "./queries/__generated__/createUser";
import { logIn, logInVariables } from "./queries/__generated__/logIn";
import { user, userVariables } from "./queries/__generated__/user";
import { refresh, refreshVariables } from "./queries/__generated__/refresh";
import { logOut, logOutVariables } from "./queries/__generated__/logOut";
import { CreatingUserProps } from "../../__generated__/types";

const userProps: CreatingUserProps = {
    fullName: "name",
    email: "email@gmail.com",
    pwdHash: "pwdHash",
    country: "Russia",
    companyOrAffiliation: "spbu",
    occupation: "student",
};

let userID: string;
let tokens: refresh["refresh"];

describe("Testing authorization", () => {
    afterAll(async () => {
        await User.destroy({
            where: {
                    userID,
            },
            force: true,
        });
    });

    it("create a user", async () => {
        const result = await testQuery<createUser, createUserVariables>({
            dirname: __dirname,
            queryName: "createUser",
            variables: {
                props: {
                    ...userProps,
                },
            },
        });

        expect(result.data).toBeDefined();
        expect(result.errors).toBeUndefined();
        expect(result.data.createUser.message).toBeTruthy();
        expect(result.data.createUser.tokens).toBeTruthy();
    });

    it("log in as a user", async () => {
        const { email, pwdHash } = userProps;

        const result = await testQuery<logIn, logInVariables>({
            dirname: __dirname,
            queryName: "logIn",
            variables: {
                email,
                pwdHash,
            },
        });

        expect(result.data).toBeTruthy();
        expect(result.errors).toBeFalsy();
        expect(result.data.logIn.accessToken).toBeTruthy();
        expect(result.data.logIn.refreshToken).toBeTruthy();

        tokens = result.data.logIn;
    });

    it("find created user", async () => {
        const { fullName, email } = userProps;

        const result = await testQuery<user, userVariables>({
            dirname: __dirname,
            queryName: "user",
            variables: {
                userID: "",
            },
            headers: {
                authorization: toAuthorizationHeader(tokens.accessToken),
            },
        });

        expect(result.data).toBeTruthy();
        expect(result.errors).toBeFalsy();
        expect(result.data.user).toBeTruthy();

        expect(result.data.user?.userID).toBeDefined();
        expect(result.data.user?.fullName).toBe(fullName);
        expect(result.data.user?.email).toBe(email);

        if (result.data.user?.userID) {
            userID = result.data.user?.userID;
        }
    });

    it("refresh token", async () => {
        const result = await testQuery<refresh, refreshVariables>({
            dirname: __dirname,
            queryName: "refresh",
            variables: {
                refreshToken: tokens.refreshToken,
            },
        });

        expect(result.data).toBeTruthy();
        expect(result.errors).toBeFalsy();
        expect(result.data.refresh.accessToken).toBeTruthy();
        expect(result.data.refresh.refreshToken).toBeTruthy();

        tokens = result.data.refresh;
    });

    it("log out", async () => {
        const result = await testQuery<logOut, logOutVariables>({
            dirname: __dirname,
            queryName: "logOut",
            variables: {
                allSessions: true,
            },
            headers: {
                authorization: toAuthorizationHeader(tokens.accessToken),
            },
        });

        expect(result.data).toBeTruthy();
        expect(result.errors).toBeFalsy();
    });
});

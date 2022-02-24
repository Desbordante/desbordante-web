import { Feedback } from "../models/Feedback";
import { FileInfo } from "../models/FileInfo";
import { RoleEnum } from "../models/permissionsConfig";
import { TaskInfo } from "../models/TaskInfo";
import { User } from "../models/User";

export const testWrapper = async (
    f: () => Promise<void>,
    testName: string, testDescription: string
) => {
    try {
        await f();
        return `Test: ${testName} -- ${testDescription} was successfully executed`;
    } catch (e) {
        let msg: string;
        if (typeof e === "string") {
            msg = e;
        } else if (e instanceof Error) {
            msg = e.message;
        } else {
            msg = `Received error with unknown type: '${typeof e}'\n\r${JSON.stringify(e)}`;
        }
        throw new Error(`Test ${testName} was failed:\n\r --> ${msg}`);
    }
};

const taskCreatingTest = async () => {
    const { ID: fileID } = await FileInfo.create({
        fileName: "FileName",
        originalFileName: "fileName",
        hasHeader: true,
        delimiter: ",",
    });
    const taskInfo = await TaskInfo.create(
        { status: "rofl" });
    await taskInfo.$create("baseConfig", {
        algorithmName: "Pyro",
        fileID,
        type: "FDA",
    });
    await taskInfo.$create("FDConfig", {
        errorThreshold: 0,
        maxLHS: 4,
        threadsCount: 1,
    });
    await taskInfo.$create("FDResult", {});
};

const UserAndFeedbackCreating = async () => {
    const user = await User.create({
        firstName: "Anton",
        lastName: "Chizhov",
        email: "zr9ihi@gmail.com",
        accountStatus: "ACCOUNT APPROVED",
        country: "Russia",
        companyOrAffiliation: "Company",
        occupation: "Occupation",
        pwdHash: "pwdHash",
    });

    const feedback = await user.$create("Feedback", {
        subject: "Letter subject",
        text: "Letter text",
        rating: 4,
    });
};

const UserAndTokensCreating = async () => {
    const user = await User.create({
        firstName: "Test2",
        lastName: "Test2",
        email: "chizhovanton@mail.ru",
        accountStatus: "EMAIL VERIFICATION",
        country: "Russia",
        companyOrAffiliation: "Company",
        occupation: "Occupation",
        pwdHash: "pwdHash",
    });
    await user.addRoles([RoleEnum.USER, RoleEnum.DEVELOPER]);
};

export const executeTests = async () => {
    await Promise.allSettled([
        testWrapper(
            taskCreatingTest,
            "Create FD Task",
            "Creating FD Algorithm Task"),
        testWrapper(
            UserAndFeedbackCreating,
            "Create User and Feedbacks",
            "Create User, Feedback and Tokens"),
        testWrapper(
            UserAndTokensCreating,
            "Create User and approve email",
            ""
        ),
    ]).then(results => {
        results.forEach((result) => {
            if (result.status == "fulfilled") {
                console.log(result.value);
            }
            if (result.status == "rejected") {
                console.log(result.reason);
            }
        });
    });
};

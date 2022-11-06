import { AccountStatusType, User } from "./models/UserData/User";
import { Device, DeviceInfoInstance } from "./models/UserData/Device";
import { Role, RoleType } from "./models/UserData/Role";
import { Session, SessionStatusType } from "./models/UserData/Session";
import { CreatingUserProps } from "../graphql/types/types";
import { mock } from "../graphql/context/mock";

async function createAccountWithLongLiveRefreshToken(roles: RoleType[]) {
    console.log(`\nCreating accounts for following roles: ${JSON.stringify(roles)}`);
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
        const [user] = await User.findOrCreate({
            where: { ...props, accountStatus },
        });
        await user.addRole(role);

        const deviceInfoString = mock.deviceInfoString;

        const deviceInfo = JSON.parse(deviceInfoString) as DeviceInfoInstance;
        let device = await Device.findByPk(deviceInfo.deviceID);
        if (!device) {
            device = await Device.addDevice(deviceInfo);
        }

        const status: SessionStatusType = "VALID";
        let session = await Session.findOne({
            where: { userID: user.userID, status },
        });
        if (!session) {
            session = await user.createSession(deviceInfo.deviceID);
        }
        const token = await session.issueAccessToken("30d");
        let answer = "";
        answer += `Account for role '${roleName}' was successfully created (userID = ${
            user.userID
        }, email = ${user.email}, pwdHash = ${
            user.pwdHash
        }).\nThis account has following permissions ${JSON.stringify(
            await user.getPermissions()
        )}`;
        answer += `\nAuthorization: Bearer ${token}`;
        answer += "\n";
        answers.push(answer);
    }
    return answers;
}

export const initTestData = async () => {
    await createAccountWithLongLiveRefreshToken(Role.getAllRoles())
        .then((results) => results.map((res) => console.log(res)))
        .catch((e) => console.error("Problems with accounts creating", e.message));
};

import { ApolloError } from "apollo-server-core";
import jwt from "jsonwebtoken";
import { BelongsTo, Column, ForeignKey, IsUUID, Model, Table } from "sequelize-typescript";
import { INTEGER, STRING, UUID, UUIDV4 } from "sequelize";
import { TokenPair } from "../../graphql/types/types";
import { Device } from "./Device";
import { User } from "./User";
import dotenv from "dotenv";

dotenv.config();

export interface RefreshTokenInstance extends jwt.JwtPayload {
    userID: string
    sessionID: string
    deviceID: string
}

export interface AccessTokenInstance {
    permissions: string[]
    userID: string
    accountStatus: string
    email: string
    fullName: string
    sessionID: string
    deviceID: string
}

interface SessionModelMethods {
    issueTokenPair: () => Promise<TokenPair>
    issueRefreshToken: () => Promise<string>
    issueAccessToken: () => Promise<string>
}

@Table({
    tableName: "Sessions",
    deletedAt: false,
    createdAt: true,
    updatedAt: false,
})
export class Session extends Model implements SessionModelMethods {
    @IsUUID(4)
    @Column({ type: UUID, primaryKey: true, defaultValue: UUIDV4 })
    sessionID!: string;

    @ForeignKey(() => User)
    @Column({ type: UUID, allowNull: false })
    userID!: string;

    @ForeignKey(() => Device)
    @Column({ type: STRING, allowNull: false })
    deviceID!: string;

    @BelongsTo(() => Device)
    device!: Device;

    @BelongsTo(() => User)
    user!: User;

    @Column({ type: STRING, allowNull: false })
    status!: string;

    @Column({ type: INTEGER, allowNull: true })
    accessTokenIat!: number;

    @Column({ type: INTEGER, allowNull: true })
    refreshTokenIat!: number;

    static getIatByJWTToken = (token: string) => {
        const payloadBase64 = Buffer.from(token.split(".")[1], "base64");
        const payload = payloadBase64.toString();
        const { iat } = JSON.parse(payload);
        return iat;
    };

    issueTokenPair = async () => {
        return {
            refreshToken: await this.issueRefreshToken(),
            accessToken: await this.issueAccessToken(),
        };
    };

    issueAccessToken = async (expiresIn = "30s") => {
        if (!process.env.SECRET_KEY) {
            throw new ApolloError("Secret key wasn't provided");
        }

        const user: User | null = await this.$get("user");
        if (!user) {
            throw new ApolloError("User not found");
        }
        const device: Device | null = await this.$get("device");
        if (!device) {
            throw new ApolloError("Device not found");
        }

        const payload: AccessTokenInstance = {
            permissions: await user.getPermissionNames(),
            email: user.email,
            accountStatus: user.accountStatus,
            fullName: user.fullName,
            userID: this.userID,
            sessionID: this.sessionID,
            deviceID: device.deviceID,
        };
        const accessToken = jwt.sign(
            payload,
            process.env.SECRET_KEY,
            { algorithm: "HS256", expiresIn }
        );
        const accessTokenIat = Session.getIatByJWTToken(accessToken);
        await this.update({ accessTokenIat });

        return accessToken;
    };

    issueRefreshToken = async () => {
        const user: User | null = await this.$get("user");
        if (!user) {
            throw new ApolloError("User not found");
        }
        const device: Device | null = await this.$get("device");
        if (!device) {
            throw new ApolloError("Device not found");
        }

        if (!process.env.SECRET_KEY) {
            throw new ApolloError("SECRET KEY wasn't provided");
        }

        const payload: RefreshTokenInstance = {
            userID: this.userID,
            sessionID: this.sessionID,
            deviceID: device.deviceID,
        };

        const refreshToken = jwt.sign(
            payload,
            process.env.SECRET_KEY,
            { algorithm: "HS256", expiresIn: "15d" }
        );
        const refreshTokenIat = Session.getIatByJWTToken(refreshToken);
        await this.update({ refreshTokenIat });

        return refreshToken;
    };
}

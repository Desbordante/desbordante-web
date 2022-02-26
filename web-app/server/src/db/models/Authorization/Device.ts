import { Column, HasMany, Index, Model, Table } from "sequelize-typescript";
import { STRING } from "sequelize";
import { Session } from "./Session";

export interface DeviceInfoInstance {
    deviceID: string
    userAgent: string
    browser: string
    engine: string
    os: string
    osVersion: string
    device: string
    cpu: string
    screen: string
    plugins: string
    timeZone: string
    language: string
}

interface DeviceModelMethods {
    isEqualTo: (device: DeviceInfoInstance) => boolean
}

@Table({
    createdAt: true,
    updatedAt: false,
    tableName: "Devices",
})
export class Device extends Model implements  DeviceModelMethods {

    @Index
    @Column({ type: STRING, primaryKey: true })
    deviceID!: string;

    @HasMany(() => Session)
    sessions?: [Session];

    @Column({ type: STRING, allowNull: true })
    userAgent?: string;

    @Column({ type: STRING, allowNull: true })
    browser?: string;

    @Column({ type: STRING, allowNull: true })
    engine?: string;

    @Column({ type: STRING, allowNull: true })
    os?: string;

    @Column({ type: STRING, allowNull: true })
    osVersion?: string;

    @Column({ type: STRING, allowNull: true })
    device?: string;

    @Column({ type: STRING, allowNull: true })
    cpu?: string;

    @Column({ type: STRING, allowNull: true })
    screen?: string;

    @Column({ type: STRING, allowNull: true })
    plugins?: string;

    @Column({ type: STRING, allowNull: true })
    timeZone?: string;

    @Column({ type: STRING, allowNull: true })
    language?: string;

    static addDevice = async (props: DeviceInfoInstance) => {
        return await Device.create({ ...props });
    };

    isEqualTo = (device: DeviceInfoInstance) => {
        const thisDevice = this as DeviceInfoInstance;
        return thisDevice === device;
    };
}

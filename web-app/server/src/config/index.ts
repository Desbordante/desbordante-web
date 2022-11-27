import "dotenv/config";

const ALL_ENVIRONMENT_TYPES = ["development", "production", "test"] as const;
type EnvType = typeof ALL_ENVIRONMENT_TYPES[number];

export const config = {
    environment: process.env.NODE_ENV as EnvType,
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === "test",
    hosts: {
        server: {
            host: process.env.SERVER_HOST,
            port: parseInt(process.env.SERVER_PORT || "5000"),
        },
    },
    producer: {
        clientId: "tasks-producer-1",
        brokers: [`${process.env.KAFKA_HOST}:${process.env.KAFKA_SERVER_PORT}`],
    },
    appConfig: {
        fileConfig: {
            allowedFileFormats: ["text/csv", "application/vnd.ms-excel"],
            allowedDelimiters: [",", "|", ";"],
            maxFileSize: 1e10,
        },
        maxThreadsCount: Number(process.env.MAX_THREADS_COUNT || "4"),
    },
    database: {
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "5432", 10),
    },
    other: {
        forceTableCreation: process.env.DB_FORCE_TABLES_RECREATION === "true",
    },
    keys: {
        secretKey: process.env.SECRET_KEY!,
    },
    topicNames: {
        tasks: process.env.KAFKA_TOPIC_NAME!,
    },
};

(() => {
    if (!ALL_ENVIRONMENT_TYPES.includes(config.environment)) {
        throw new Error(
            `Received incorrect NODE_ENV={${
                config.environment
            }}, expected: ${JSON.stringify(ALL_ENVIRONMENT_TYPES)}`
        );
    }
})();

export default config;

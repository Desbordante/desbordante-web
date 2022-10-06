import { Kafka, Partitioners } from "kafkajs";
import { ApolloError } from "apollo-server-core";
import { config } from "../config";

const { clientId, brokers } = config.producer;

const kafka = new Kafka({
    clientId,
    brokers,
});

export const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
});

const MESSAGE_TYPES = ["taskProcessing", "fileProcessing"] as const;
export type MessageType = typeof MESSAGE_TYPES[number];

export const produce = async (message: { taskID: string, type: MessageType }, topic: string) => {
    await producer.connect().catch((e) => {
        console.error("Error while connecting to producer", e);
        throw e;
    });
    const { taskID, type } = message;

    try {
        await producer.send({
            topic,
            messages: [
                {
                    key: taskID,
                    value: Buffer.from(JSON.stringify({ taskID, type })),
                },
            ],
        });
    } catch (err) {
        throw new ApolloError(
            `Couldn't write message '${JSON.stringify(message)}' to topic '${topic}'`
        );
    }
};

export default produce;

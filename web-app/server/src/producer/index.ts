import Kafka, { LibrdKafkaError } from "node-rdkafka";

export const producer = new Kafka.Producer(
    {
      "client.id": "tasks-producer-1",
      "metadata.broker.list": `${process.env.KAFKA_HOST}:${process.env.KAFKA_SERVER_PORT}`,
    }
);

producer.setPollInterval(100);

producer
    .on("event.log", console.log);

producer
    .on("event.error", (err) => {
        console.error("Error from producer");
        console.error(err);
    });

producer
    .on("disconnected", (arg) => {
        console.log("producer disconnected. " + JSON.stringify(arg));
    });

const client = Kafka.AdminClient.create({
  "client.id": `${process.env.KAFKA_ADMIN_CLIENT_ID}`,
  "bootstrap.servers": `${process.env.KAFKA_HOST}:${process.env.KAFKA_SERVER_PORT}`,
  "metadata.broker.list": `${process.env.KAFKA_HOST}:${process.env.KAFKA_SERVER_PORT}`,
});

producer.connect()
    .on("ready", (i, metadata) => {
        const tasksTopicName = process.env.KAFKA_TOPIC_NAME;
        let isTopicTasksCreated = false;
        metadata.topics.forEach((topic) => {
            if (topic.name === tasksTopicName) {
                isTopicTasksCreated = true;
            }
        });
        if (isTopicTasksCreated) {
            console.debug(`Topic '${tasksTopicName}' already exists`);
        } else {
            console.debug(`Topic '${tasksTopicName}' not found`);
            console.debug(`Creating topic '${tasksTopicName}'`);
            client.createTopic({
                topic: `${tasksTopicName}`,
                num_partitions: 1,
                replication_factor: 1,
            }, (err: LibrdKafkaError) => {
                if (err != undefined) {
                    console.debug(err.message);
                } else {
                    console.debug(`Topic '${process.env.KAFKA_TOPIC_NAME}' was created`);
                    client.disconnect();
                }
            });
        }
    })
    .on("event.error", (err) => {
        console.log("err", err.message);
    });

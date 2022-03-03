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
  "bootstrap.servers":
      `${process.env.KAFKA_HOST}:${process.env.KAFKA_SERVER_PORT}`,
  "metadata.broker.list":
      `${process.env.KAFKA_HOST}:${process.env.KAFKA_SERVER_PORT}`,
});

producer.connect()
    .on("ready", (i, metadata) => {
      let isTopicTasksCreated = false;
      metadata.topics.forEach((topic) => {
        if (topic.name === process.env.KAFKA_TOPIC_NAME) {
          isTopicTasksCreated = true;
        }
      });
      if (isTopicTasksCreated) {
        console.debug(`Topic '${process.env.DB_TASKS_TABLE_NAME}' already exists`);
      } else {
        console.debug(`Topic '${process.env.DB_TASKS_TABLE_NAME}' not found`);
        console.debug(`Creating topic '${process.env.DB_TASKS_TABLE_NAME}'`);
        client.createTopic({
          topic: `${process.env.DB_TASKS_TABLE_NAME}`,
          num_partitions: 1,
          replication_factor: 1,
        }, (res: LibrdKafkaError) => {
          if (res !== undefined) {
            console.debug(res);
          } else {
            console.debug(`Topic '${process.env.DB_TASKS_TABLE_NAME}' was created`);
            client.disconnect();
          }
        });
      }
    })
    .on("event.error", (err) => {
      console.log("err");
      console.log(err);
    });

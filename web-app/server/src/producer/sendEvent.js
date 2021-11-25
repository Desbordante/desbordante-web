const producer = require("./index");

async function sendEvent(topicName, taskID) {
  const value = Buffer.from(JSON.stringify({ taskID }));
  const key = taskID;
  // use the default partitioner
  const partition = -1;
  const headers = [
    { header: "header value" }
  ];
  await producer.produce(topicName, partition, value, key, Date.now(), "", headers);
}

module.exports = sendEvent;

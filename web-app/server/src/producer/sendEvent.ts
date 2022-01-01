import producer from "./index"

const sendEvent = async (topicName: string, taskID: string ) => {
  const value = Buffer.from(JSON.stringify({ taskID }));
  const key = taskID;
  // use the default partitioner
  const partition = -1;
  const headers = [
    { header: "header value" }
  ];
  await producer.produce(topicName, partition, value, key, Date.now(), "", headers);
}

export = sendEvent;

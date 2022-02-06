import axios, { AxiosResponse } from "axios";

export const serverURL = `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}`;
export const graphQLEndpoint = `${serverURL}/graphql`;

/* eslint-disable no-console */
/* eslint-disable comma-dangle */

export async function getData(property: string) {
  try {
    const response = await axios.get(`${serverURL}/${property}`);
    return response.data;
  } catch (e) {
    return e;
  }
}

type parameters = {
  algName: string;
  separator: string;
  errorPercent: number;
  hasHeader: boolean;
  maxLHS: number;
  parallelism: string;
  // isBuiltinDataset: boolean;
  fileName?: string;
};

export function submitBuiltinDataset(
  params: parameters,
  /* eslint-disable-next-line no-unused-vars */
  onComplete: (res: AxiosResponse) => void
) {
  const json = JSON.stringify({ ...params, isBuiltinDataset: true });
  const blob = new Blob([json], {
    type: "application/json",
  });

  const data = new FormData();
  data.append("json", blob);

  axios.post(`${serverURL}/createTask`, data, {
    headers: { "Content-Type": "multipart/form-data" }
  }).then((response) => {
    onComplete(response);
  });
}

export function submitCustomDataset(
  CSVTable: File,
  params: parameters,
  /* eslint-disable-next-line no-unused-vars */
  onProgress: (n: number) => void,
  /* eslint-disable-next-line no-unused-vars */
  onComplete: (res: AxiosResponse) => void
) {
  const json = JSON.stringify({ ...params, isBuiltinDataset: false });
  const blob = new Blob([json], {
    type: "application/json",
  });

  const data = new FormData();
  data.append("json", blob);

  if (!CSVTable) {
    throw Error("CSVTable not provided, incorrect work");
  } else {
    data.append("table", CSVTable, CSVTable.name);
  }

  const config = {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent: ProgressEvent) => {
      onProgress(progressEvent.loaded / progressEvent.total);
    },
  };

  axios.post(`${serverURL}/createTask`, data, config).then((response) => {
    onComplete(response);
  });
}
